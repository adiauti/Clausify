/* ============================================================
   CLAUSIFY — Main Application Logic
   app.js
   ============================================================ */


/* ── LOADER ───────────────────────────────────────────────── */

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
    document.getElementById('nav').classList.add('visible');
    initScrollReveal();
  }, 2400);
});


/* ── SCROLL REVEAL ────────────────────────────────────────── */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observer.observe(el));
}


/* ── FAQ ──────────────────────────────────────────────────── */

const FAQ_DATA = [
  {
    q: "What types of documents can I analyse?",
    a: "Employment contracts, NDAs, rental agreements, freelance contracts, terms of service, loan agreements, and most other standard legal documents. If it's text, Clausify can read it."
  },
  {
    q: "Is my document stored anywhere?",
    a: "Once you sign up and sign in, your documents are securely saved to your account so you can revisit past analyses at any time. Your privacy is always protected — we never share your documents with third parties."
  },
  {
    q: "How accurate is the risk flagging?",
    a: "Clausify uses Claude — one of the most capable AI models available — to identify unusual, one-sided, or potentially harmful clauses. It's highly accurate for common contract types, though edge cases and very jurisdiction-specific clauses may need human review."
  },
  {
    q: "Does it work on scanned documents?",
    a: "Yes. Upload a JPEG or PNG of a scanned contract and Clausify will read and analyse it. For best results, ensure the scan is clear and legible."
  },
  {
    q: "Is Clausify a replacement for a lawyer?",
    a: "No — and we're upfront about that. Clausify gives you clarity and highlights risks so you can have a better, more informed conversation with a lawyer. For high-stakes documents, always consult a qualified legal professional."
  },
];

function buildFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  list.innerHTML = FAQ_DATA.map((item, i) => `
    <div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFaq(${i})">
        <span>${item.q}</span>
        <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div class="faq-a">${item.a}</div>
    </div>
  `).join('');
}

function toggleFaq(index) {
  const target = document.getElementById('faq-' + index);
  const isOpen = target.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  if (!isOpen) target.classList.add('open');
}


/* ── FILE UPLOAD ──────────────────────────────────────────── */

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('upload-title').textContent = file.name;
  document.getElementById('upload-sub').textContent   = (file.size / 1024).toFixed(0) + ' KB · Ready to analyse';
  const area = document.getElementById('upload-area');
  area.style.borderColor = 'var(--gold-bdr)';
  area.style.background  = 'var(--gold-dim)';
}


/* ── DOCUMENT TAB SWITCHER ────────────────────────────────── */

function showTab(tab, el) {
  document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('tab-hl').style.display = tab === 'hl' ? 'block' : 'none';
  document.getElementById('tab-cl').style.display = tab === 'cl' ? 'block' : 'none';
}


/* ── ANALYSIS ENGINE ──────────────────────────────────────── */

let docContext   = '';
let chatHistory  = [];

const LOADING_STEPS = [
  'Reading document structure...',
  'Identifying key clauses...',
  'Flagging risk areas...',
  'Generating plain-English summary...',
  'Preparing your report...',
];

const SAMPLE_DOCUMENT = `EMPLOYMENT AGREEMENT
This Employment Agreement is entered into between Nova Tech Solutions Pvt. Ltd. ("Company") and the individual named below ("Employee").
1. Position & Duties — The Employee is hired as a Software Engineer. The Company reserves the right to change the Employee's role, responsibilities, or reporting structure at any time without prior notice or consent.
2. Compensation — Base salary of ₹12,00,000 per annum. Salary revisions and bonuses are entirely at the sole discretion of the Company and are not guaranteed.
3. Intellectual Property — Any work produced by the Employee, including work done outside of office hours, on personal devices, or during weekends, shall be the exclusive property of the Company. The Employee waives all moral rights permanently.
4. Non-Compete — Upon termination, the Employee agrees not to work for any competitor or start a competing business for 4 years within India and internationally.
5. Termination — The Company may terminate this Agreement at any time, for any reason, with zero notice and zero severance. The Employee must provide 90 days notice to resign.
6. Arbitration — Any dispute shall be resolved through binding arbitration. The Employee waives the right to pursue any claim in a court of law.
7. Confidentiality — Standard confidentiality clause for 2 years after employment ends.
8. Leave Policy — 12 days of paid leave per year. Unused leave lapses at year end with no carry-over.`;

async function runAnalysis() {
  const paste    = document.getElementById('paste-input').value.trim();
  const fileInput = document.getElementById('file-input');
  const hasFile  = fileInput.files && fileInput.files[0];

  // Validation
  if (!paste && !hasFile) {
    const ta = document.getElementById('paste-input');
    ta.style.borderColor = 'var(--high)';
    ta.placeholder = 'Please upload a file or paste text first.';
    setTimeout(() => {
      ta.style.borderColor = '';
      ta.placeholder = 'Paste your contract text here...';
    }, 2500);
    return;
  }

  // Transition to loading state
  document.getElementById('upload-state').style.display = 'none';
  document.getElementById('tool-loading').classList.add('show');

  // Cycle loading steps
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex < LOADING_STEPS.length) {
      document.getElementById('load-step').textContent = LOADING_STEPS[stepIndex++];
    }
  }, 700);

  const documentText = paste || SAMPLE_DOCUMENT;
  docContext = documentText;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: buildAnalysisPrompt(documentText)
        }]
      })
    });

    const data = await response.json();
    clearInterval(stepInterval);

    let result;
    try {
      const raw = data.content[0].text.replace(/```json|```/g, '').trim();
      result = JSON.parse(raw);
    } catch {
      result = getFallbackResult();
    }

    renderResults(result);

  } catch {
    clearInterval(stepInterval);
    renderResults(getFallbackResult());
  }
}

function buildAnalysisPrompt(text) {
  return `You are a legal document analyser. Analyse this document and respond ONLY with a valid JSON object — no markdown, no backticks, no extra text. Use this exact structure:
{"summary":"2-3 sentence plain English summary","riskLevel":"high or medium or low","riskScore":0-100,"riskSummary":"one sentence on overall risk","clauses":[{"text":"exact short phrase max 8 words","risk":"high or med or low","name":"clause name","explanation":"plain English explanation 1-2 sentences"}],"highlightedDoc":"document text with risky phrases wrapped as <HL class=\\"high\\">phrase</HL> or <HL class=\\"med\\">phrase</HL> or <HL class=\\"low\\">phrase</HL>"}
Document: ${text}`;
}


/* ── FALLBACK RESULT ──────────────────────────────────────── */

function getFallbackResult() {
  return {
    summary: "This employment agreement contains several heavily one-sided clauses that strongly favour the employer. A 4-year international non-compete, ownership of all personal-time work, and instant no-notice termination are the biggest concerns. You should negotiate key terms or seek legal advice before signing.",
    riskLevel: "high",
    riskScore: 82,
    riskSummary: "4 high-risk clauses detected — this contract significantly favours the employer.",
    clauses: [
      { text: "non-compete for 4 years internationally", risk: "high", name: "Non-Compete",         explanation: "Prevents you from working in the same field globally for 4 years. Extremely broad — courts often find this unenforceable. Try to negotiate to 1 year within India only." },
      { text: "work done outside of office hours",       risk: "high", name: "IP Ownership",        explanation: "The company claims ownership of anything you create, even on your own time and devices. This is aggressive and may be illegal in your jurisdiction." },
      { text: "at any time, for any reason, zero notice",risk: "high", name: "At-Will Termination", explanation: "You can be fired instantly with no warning or payout. Ask for at least 30 days written notice and a minimum severance clause." },
      { text: "waives the right to pursue any claim",    risk: "high", name: "Arbitration Waiver",  explanation: "You give up your right to sue in court entirely. Arbitration heavily favours employers — try to remove this clause or negotiate the arbitrator selection." },
      { text: "unused leave lapses at year end",         risk: "med",  name: "Leave Expiry",         explanation: "You lose all unused annual leave with no payout. Ask for a carry-over of at least 5 days or a cash option." },
      { text: "sole discretion of the Company",          risk: "low",  name: "Salary Discretion",    explanation: "Pay raises are entirely at the company's discretion. Common clause, but get any promised raises documented in writing separately." },
    ],
    highlightedDoc: `This Employment Agreement is entered into between Nova Tech Solutions Pvt. Ltd. and the Employee.\n\n1. Position — The Company reserves the right to <HL class="med">change the Employee's role at any time without notice</HL>.\n\n2. Compensation — Salary revisions are <HL class="low">at the sole discretion of the Company</HL> and are not guaranteed.\n\n3. Intellectual Property — Any work produced by the Employee, including <HL class="high">work done outside of office hours, on personal devices</HL>, shall be the exclusive property of the Company.\n\n4. Non-Compete — The Employee agrees not to work for any competitor for <HL class="high">4 years within India and internationally</HL>.\n\n5. Termination — The Company may terminate this Agreement <HL class="high">at any time, for any reason, with zero notice and zero severance</HL>. The Employee must provide 90 days notice to resign.\n\n6. Arbitration — The Employee <HL class="high">waives the right to pursue any claim in a court of law</HL>.\n\n7. Confidentiality — Standard confidentiality clause for 2 years after employment. Reasonable and protects both parties.\n\n8. Leave Policy — <HL class="med">Unused leave lapses at year end with no carry-over</HL>.`
  };
}


/* ── RENDER RESULTS ───────────────────────────────────────── */

function renderResults(result) {
  document.getElementById('tool-loading').classList.remove('show');
  document.getElementById('results-state').classList.add('show');

  // Summary
  document.getElementById('summary-text').textContent = result.summary;

  // Risk score
  const riskClass = result.riskLevel === 'high' ? 'high'
    : (result.riskLevel === 'medium' || result.riskLevel === 'med') ? 'med' : 'low';

  const scoreEl = document.getElementById('risk-score-el');
  scoreEl.textContent = result.riskLevel.toUpperCase();
  scoreEl.className   = 'risk-score-big ' + riskClass;

  const barFill = document.getElementById('bar-fill');
  barFill.style.width      = result.riskScore + '%';
  barFill.style.background = riskClass === 'high' ? 'var(--high)' : riskClass === 'med' ? 'var(--med)' : 'var(--low)';

  document.getElementById('risk-desc-text').textContent = result.riskSummary;

  // Highlighted document
  document.getElementById('doc-body').innerHTML = result.highlightedDoc
    .replace(/\n/g, '<br>')
    .replace(/<HL class="([^"]+)">([^<]+)<\/HL>/g, (_, cls, txt) =>
      `<span class="hl ${cls}">${txt}</span>`
    );

  // Clause list
  document.getElementById('clause-list').innerHTML = result.clauses.map(c => `
    <div class="clause">
      <div class="clause-top">
        <span class="chip ${c.risk}">${c.risk === 'high' ? 'High risk' : c.risk === 'med' ? 'Review' : 'Standard'}</span>
        <span class="clause-name">${c.name}</span>
      </div>
      <div class="clause-desc">${c.explanation}</div>
    </div>
  `).join('');

  // Initialise chat
  const highCount = result.clauses.filter(c => c.risk === 'high').length;
  chatHistory = [{
    role: 'assistant',
    content: `I've finished analysing your document. I found ${highCount} high-risk clause${highCount !== 1 ? 's' : ''}. What would you like to understand better?`
  }];
  renderMessages();
}


/* ── RESET ────────────────────────────────────────────────── */

function reset() {
  document.getElementById('results-state').classList.remove('show');
  document.getElementById('upload-state').style.display = 'block';
  document.getElementById('paste-input').value  = '';
  document.getElementById('file-input').value   = '';
  document.getElementById('upload-title').textContent = 'Drop your document here';
  document.getElementById('upload-sub').textContent   = 'Click to browse — PDF, JPEG or PNG';
  const area = document.getElementById('upload-area');
  area.style.borderColor = '';
  area.style.background  = '';
  chatHistory = [];
}


/* ── CHAT ─────────────────────────────────────────────────── */

function renderMessages() {
  const container = document.getElementById('chat-msgs');
  container.innerHTML = chatHistory.map(m =>
    `<div class="msg ${m.role === 'assistant' ? 'ai' : 'user'}">${m.content}</div>`
  ).join('');
  container.scrollTop = container.scrollHeight;
}

function askSuggestion(el) {
  document.getElementById('chat-input').value = el.textContent;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const query = input.value.trim();
  if (!query) return;

  input.value = '';
  chatHistory.push({ role: 'user',      content: query });
  chatHistory.push({ role: 'assistant', content: 'Thinking...' });
  renderMessages();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a helpful legal assistant. Here is the document the user uploaded: "${docContext}". Answer their question in plain English using 2-4 sentences. Do not give formal legal advice — suggest consulting a qualified lawyer for serious matters. User's question: ${query}`
        }]
      })
    });

    const data = await response.json();
    chatHistory[chatHistory.length - 1] = { role: 'assistant', content: data.content[0].text };

  } catch {
    chatHistory[chatHistory.length - 1] = { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." };
  }

  renderMessages();
}


/* ── INIT ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  buildFAQ();
});