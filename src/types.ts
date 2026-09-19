export type AuthTab = 'signin' | 'signup';
export type Risk = 'high' | 'med' | 'low';
export type Message = { role: 'assistant' | 'user'; content: string };
export type Clause = { text: string; risk: Risk; name: string; explanation: string };
export type AnalysisResult = {
  summary: string;
  riskLevel: 'high' | 'medium' | 'low' | 'med';
  riskScore: number;
  riskSummary: string;
  clauses: Clause[];
  highlightedDoc: string;
};
