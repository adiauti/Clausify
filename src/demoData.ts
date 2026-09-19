import type { AnalysisResult } from './types';

export const DEMO_RESULT: AnalysisResult = {
  summary: 'This employment agreement contains several heavily one-sided clauses that strongly favour the employer. A 4-year international non-compete, ownership of all personal-time work, and instant no-notice termination are the biggest concerns. You should negotiate key terms or seek legal advice before signing.',
  riskLevel: 'high',
  riskScore: 82,
  riskSummary: '4 high-risk clauses detected — this contract significantly favours the employer.',
  clauses: [
    { text: 'non-compete for 4 years internationally', risk: 'high', name: 'Non-Compete', explanation: 'Prevents you from working in the same field globally for 4 years. Extremely broad — courts often find this unenforceable.' },
    { text: 'work done outside of office hours', risk: 'high', name: 'IP Ownership', explanation: 'The company claims ownership of anything you create, even on your own time and devices. This is aggressive and may be illegal in your jurisdiction.' },
    { text: 'at any time, for any reason, zero notice', risk: 'high', name: 'At-Will Termination', explanation: 'You can be fired instantly with no warning or payout. Ask for written notice and a minimum severance clause.' },
    { text: 'waives the right to pursue any claim', risk: 'high', name: 'Arbitration Waiver', explanation: 'You give up your right to sue in court entirely. Consider getting legal advice before accepting this clause.' },
    { text: 'unused leave lapses at year end', risk: 'med', name: 'Leave Expiry', explanation: 'You lose all unused annual leave with no payout. Ask for a carry-over or cash option.' },
    { text: 'sole discretion of the Company', risk: 'low', name: 'Salary Discretion', explanation: 'Pay raises are entirely at the company\'s discretion. Get any promised raises documented separately.' },
  ],
  highlightedDoc: `This Employment Agreement is entered into between Nova Tech Solutions Pvt. Ltd. and the Employee.\n\n1. Position — The Company reserves the right to <HL class="med">change the Employee's role at any time without notice</HL>.\n\n2. Compensation — Salary revisions are <HL class="low">at the sole discretion of the Company</HL> and are not guaranteed.\n\n3. Intellectual Property — Any work produced by the Employee, including <HL class="high">work done outside of office hours, on personal devices</HL>, shall be the exclusive property of the Company.\n\n4. Non-Compete — The Employee agrees not to work for any competitor for <HL class="high">4 years within India and internationally</HL>.\n\n5. Termination — The Company may terminate this Agreement <HL class="high">at any time, for any reason, with zero notice and zero severance</HL>.\n\n6. Arbitration — The Employee <HL class="high">waives the right to pursue any claim in a court of law</HL>.\n\n7. Confidentiality — Standard confidentiality clause for 2 years after employment.\n\n8. Leave Policy — <HL class="med">Unused leave lapses at year end with no carry-over</HL>.`,
};
