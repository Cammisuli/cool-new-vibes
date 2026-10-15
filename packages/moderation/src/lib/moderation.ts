import type { Vibe } from '@cool-new-vibes/vibe-model';
import { totalReactions } from '@cool-new-vibes/vibe-scoring';

export type Verdict = 'approve' | 'review' | 'reject';

export interface ModerationResult {
  vibeId: string;
  verdict: Verdict;
  reasons: string[];
  risk: number; // 0..1
}

export interface ModerationRules {
  blockedTerms: string[];
  maxLinks: number;
  maxCapsRatio: number;
  maxRepeatedChars: number;
}

export const defaultRules: ModerationRules = {
  blockedTerms: ['buy followers', 'free crypto', 'click here'],
  maxLinks: 1,
  maxCapsRatio: 0.7,
  maxRepeatedChars: 6,
};

export function capsRatio(text: string): number {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 8) return 0;
  return letters.replace(/[^A-Z]/g, '').length / letters.length;
}

export function longestRun(text: string): number {
  let longest = 0;
  let current = 0;
  for (let i = 0; i < text.length; i++) {
    current = i > 0 && text[i] === text[i - 1] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

export function moderate(vibe: Vibe, rules: ModerationRules = defaultRules): ModerationResult {
  const reasons: string[] = [];
  let risk = 0;
  const lower = vibe.text.toLowerCase();

  for (const term of rules.blockedTerms) {
    if (lower.includes(term)) {
      reasons.push(`blocked term: "${term}"`);
      risk += 0.6;
    }
  }
  const links = (vibe.text.match(/https?:\/\//g) ?? []).length;
  if (links > rules.maxLinks) {
    reasons.push(`too many links (${links})`);
    risk += 0.3;
  }
  if (capsRatio(vibe.text) > rules.maxCapsRatio) {
    reasons.push('excessive caps');
    risk += 0.2;
  }
  if (longestRun(vibe.text) > rules.maxRepeatedChars) {
    reasons.push('repeated characters');
    risk += 0.15;
  }
  // Popular vibes are less likely to be spam; give them some benefit of the doubt.
  if (totalReactions(vibe) > 25) risk -= 0.1;

  risk = Math.min(1, Math.max(0, risk));
  const verdict: Verdict = risk >= 0.6 ? 'reject' : risk >= 0.2 ? 'review' : 'approve';
  return { vibeId: vibe.id, verdict, reasons, risk };
}

export function buildQueue(vibes: Vibe[], rules: ModerationRules = defaultRules) {
  return vibes
    .map((v) => moderate(v, rules))
    .filter((r) => r.verdict !== 'approve')
    .sort((a, b) => b.risk - a.risk || a.vibeId.localeCompare(b.vibeId));
}
