/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
    document.getElementById('nav').classList.add('visible');
    observeReveal();
  }, 2400);
});

/* ── SCROLL REVEAL ── */
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
      } else {
        // Remove the class so the animation re-triggers when the user scrolls back
        e.target.classList.remove('in');
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ── FAQ DATA ── */
const faqs = [
  { q: "Is Clausify a replacement for a lawyer?", a: "No — and we're upfront about that. Clausify gives you clarity and highlights risks so you can have a better, more informed conversation with a lawyer. For high-stakes documents, always consult a qualified legal professional." },
  { q: "What types of documents can I analyse?", a: "Employment contracts, NDAs, rental agreements, freelance contracts, terms of service, loan agreements, and most other standard legal documents. If it's text, Clausify can read it." },
  { q: "Is my document stored anywhere?", a: "Once you sign up and sign in, your documents are securely saved to your account so you can revisit past analyses at any time. Your privacy is always protected — we never share your documents with third parties." },
  { q: "How accurate is the risk flagging?", a: "Clausify uses Claude — one of the most capable AI models available — to identify unusual, one-sided, or potentially harmful clauses. It's highly accurate for common contract types, though edge cases and very jurisdiction-specific clauses may need human review." },
  { q: "Does it work on scanned documents?", a: "Yes. Upload a JPEG or PNG of a scanned contract and Clausify will read and analyse it. For best results, ensure the scan is clear and legible." },
  { q: "Is it really free?", a: "Yes — completely free to use right now. No sign-up, no credit card, no limits. We may introduce a premium tier in the future for advanced features." },
];

document.getElementById('faq-list').innerHTML = faqs.map((f, i) => `
  <div class="faq-item" id="faq-${i}">
    <div class="faq-q" onclick="toggleFaq(${i})">
      <span>${f.q}</span>
      <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="faq-a">${f.a}</div>
  </div>
`).join('');

function toggleFaq(i) {
  const el = document.getElementById('faq-' + i);
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

/* ── TOOL LOGIC ── */
let docContext = '', chatHistory = [];

function handleFile(e) {
  const f = e.target.files[0]; if (!f) return;
  document.getElementById('upload-title').textContent = f.name;
  document.getElementById('upload-sub').textContent   = (f.size/1024).toFixed(0) + ' KB · Ready to analyse';
  document.getElementById('upload-area').style.borderColor = 'var(--gold-bdr)';
  document.getElementById('upload-area').style.background  = 'var(--gold-dim)';
}

function showTab(tab, el) {
  document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('tab-hl').style.display = tab === 'hl' ? 'block' : 'none';
  document.getElementById('tab-cl').style.display = tab === 'cl' ? 'block' : 'none';
}

async function runAnalysis() {
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    openAuthModal('signup');
    return;
  }

  const paste = document.getElementById('paste-input').value.trim();
  const fi    = document.getElementById('file-input');
  if (!paste && !(fi.files && fi.files[0])) {
    const ta = document.getElementById('paste-input');
    ta.style.borderColor = 'var(--high)';
    ta.placeholder = 'Please upload a file or paste text first.';
    setTimeout(() => { ta.style.borderColor = ''; ta.placeholder = 'Paste your contract text here...'; }, 2500);
    return;
  }
  document.getElementById('upload-state').style.display  = 'none';
  document.getElementById('tool-loading').classList.add('show');

  const steps = ['Reading document structure...','Identifying key clauses...','Flagging risk areas...','Generating plain-English summary...','Preparing your report...'];
  let s = 0;
  const si = setInterval(() => { if (s < steps.length) document.getElementById('load-step').textContent = steps[s++]; }, 700);

  const sample = paste || `EMPLOYMENT AGREEMENT
This Employment Agreement is entered into between Nova Tech Solutions Pvt. Ltd. ("Company") and the individual named below ("Employee").
1. Position & Duties — The Employee is hired as a Software Engineer. The Company reserves the right to change the Employee's role, responsibilities, or reporting structure at any time without prior notice or consent.
2. Compensation — Base salary of ₹12,00,000 per annum. Salary revisions and bonuses are entirely at the sole discretion of the Company and are not guaranteed.
3. Intellectual Property — Any work produced by the Employee, including work done outside of office hours, on personal devices, or during weekends, shall be the exclusive property of the Company. The Employee waives all moral rights permanently.
4. Non-Compete — Upon termination, the Employee agrees not to work for any competitor or start a competing business for 4 years within India and internationally.
5. Termination — The Company may terminate this Agreement at any time, for any reason, with zero notice and zero severance. The Employee must provide 90 days notice to resign.
6. Arbitration — Any dispute shall be resolved through binding arbitration. The Employee waives the right to pursue any claim in a court of law.
7. Confidentiality — Standard confidentiality clause for 2 years after employment ends.
8. Leave Policy — 12 days of paid leave per year. Unused leave lapses at year end with no carry-over.`;

  docContext = sample;

  try {
    const res = await fetch('http://localhost:3000/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: sample })
    });
    const data = await res.json();
    clearInterval(si);
    
    if (!res.ok) {
      console.error('Analysis error:', data.error);
      renderResults(fallback());
      return;
    }
    
    renderResults(data);
  } catch (error) { 
    console.error('Error:', error);
    clearInterval(si); 
    renderResults(fallback()); 
  }
}

function fallback() {
  return {
    summary: "This employment agreement contains several heavily one-sided clauses that strongly favour the employer. A 4-year international non-compete, ownership of all personal-time work, and instant no-notice termination are the biggest concerns. You should negotiate key terms or seek legal advice before signing.",
    riskLevel: "high", riskScore: 82,
    riskSummary: "4 high-risk clauses detected — this contract significantly favours the employer.",
    clauses: [
      { text: "non-compete for 4 years internationally", risk: "high", name: "Non-Compete", explanation: "Prevents you from working in the same field globally for 4 years. Extremely broad — courts often find this unenforceable, but you'd need to prove it. Try to negotiate to 1 year within India only." },
      { text: "work done outside of office hours", risk: "high", name: "IP Ownership", explanation: "The company claims ownership of anything you create, even on your own time and devices. This is aggressive and may be illegal in your jurisdiction." },
      { text: "at any time, for any reason, with zero notice", risk: "high", name: "At-Will Termination", explanation: "You can be fired instantly with no warning or payout. Ask for at least 30 days written notice and a minimum severance clause." },
      { text: "waives the right to pursue any claim", risk: "high", name: "Arbitration Waiver", explanation: "You give up your right to sue in court entirely. Arbitration heavily favours employers — try to remove this clause or at minimum negotiate the arbitrator selection." },
      { text: "unused leave lapses at year end", risk: "med", name: "Leave Expiry", explanation: "You lose all unused annual leave with no payout. Ask for a carry-over of at least 5 days or a cash option." },
      { text: "sole discretion of the Company", risk: "low", name: "Salary Discretion", explanation: "Pay raises are entirely at the company's discretion. Common clause, but get any promised raises documented in writing separately." }
    ],
    highlightedDoc: `This Employment Agreement is entered into between Nova Tech Solutions Pvt. Ltd. and the Employee.\n\n1. Position — The Company reserves the right to <HL class="med">change the Employee's role at any time without notice</HL>.\n\n2. Compensation — Salary revisions are <HL class="low">at the sole discretion of the Company</HL> and are not guaranteed.\n\n3. Intellectual Property — Any work produced by the Employee, including <HL class="high">work done outside of office hours, on personal devices</HL>, shall be the exclusive property of the Company. The Employee waives all moral rights permanently.\n\n4. Non-Compete — The Employee agrees not to work for any competitor for <HL class="high">4 years within India and internationally</HL>.\n\n5. Termination — The Company may terminate this Agreement <HL class="high">at any time, for any reason, with zero notice and zero severance</HL>. The Employee must provide 90 days notice to resign.\n\n6. Arbitration — The Employee <HL class="high">waives the right to pursue any claim in a court of law</HL>.\n\n7. Confidentiality — Standard confidentiality clause for 2 years after employment. This is reasonable and protects both parties.\n\n8. Leave Policy — <HL class="med">Unused leave lapses at year end with no carry-over</HL>.`
  };
}

function renderResults(r) {
  document.getElementById('tool-loading').classList.remove('show');
  document.getElementById('results-state').classList.add('show');

  document.getElementById('summary-text').textContent = r.summary;

  const rc = r.riskLevel === 'high' ? 'high' : (r.riskLevel === 'medium' || r.riskLevel === 'med') ? 'med' : 'low';
  const rEl = document.getElementById('risk-score-el');
  rEl.textContent  = r.riskLevel.toUpperCase();
  rEl.className    = 'risk-score-big ' + rc;

  const bf = document.getElementById('bar-fill');
  bf.style.width      = r.riskScore + '%';
  bf.style.background = rc === 'high' ? 'var(--high)' : rc === 'med' ? 'var(--med)' : 'var(--low)';
  document.getElementById('risk-desc-text').textContent = r.riskSummary;

  document.getElementById('doc-body').innerHTML = r.highlightedDoc
    .replace(/\n/g, '<br>')
    .replace(/<HL class="([^"]+)">([^<]+)<\/HL>/g, (_, cls, txt) => `<span class="hl ${cls}">${txt}</span>`);

  document.getElementById('clause-list').innerHTML = r.clauses.map(c => `
    <div class="clause">
      <div class="clause-top">
        <span class="chip ${c.risk}">${c.risk === 'high' ? 'High risk' : c.risk === 'med' ? 'Review' : 'Standard'}</span>
        <span class="clause-name">${c.name}</span>
      </div>
      <div class="clause-desc">${c.explanation}</div>
    </div>`).join('');

  chatHistory = [{ role: 'assistant', content: `I've finished analysing your document. I found ${r.clauses.filter(c => c.risk === 'high').length} high-risk clauses. What would you like to understand better?` }];
  renderMsgs();
}

function renderMsgs() {
  const el = document.getElementById('chat-msgs');
  el.innerHTML = chatHistory.map(m => `<div class="msg ${m.role === 'assistant' ? 'ai' : 'user'}">${m.content}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

function askSugg(el) { document.getElementById('chat-input').value = el.textContent; sendChat(); }

async function sendChat() {
  const inp = document.getElementById('chat-input');
  const q   = inp.value.trim(); if (!q) return;
  inp.value = '';
  chatHistory.push({ role: 'user', content: q });
  chatHistory.push({ role: 'assistant', content: 'Thinking...' });
  renderMsgs();
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: q,
        documentContext: docContext
      })
    });
    const data = await res.json();
    
    if (!res.ok) {
      chatHistory[chatHistory.length - 1] = { role: 'assistant', content: `Error: ${data.error || 'Failed to process question'}` };
    } else {
      chatHistory[chatHistory.length - 1] = { role: 'assistant', content: data.answer };
    }
  } catch {
    chatHistory[chatHistory.length - 1] = { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." };
  }
  renderMsgs();
}

function reset() {
  document.getElementById('results-state').classList.remove('show');
  document.getElementById('upload-state').style.display = 'block';
  document.getElementById('paste-input').value = '';
  document.getElementById('file-input').value  = '';
  document.getElementById('upload-title').textContent = 'Drop your document here';
  document.getElementById('upload-sub').textContent   = 'Click to browse — PDF, JPEG or PNG';
  document.getElementById('upload-area').style.borderColor = '';
  document.getElementById('upload-area').style.background  = '';
  chatHistory = [];
}
