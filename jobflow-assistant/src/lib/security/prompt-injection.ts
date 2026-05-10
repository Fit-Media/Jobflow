const suspiciousPatterns = [
  /ignore (all )?(previous|above|system|developer) instructions/i,
  /reveal (the )?(system prompt|secrets|api key|tokens?)/i,
  /(send|submit|apply|confirm) (this|the) (email|application|form)/i,
  /bypass (captcha|mfa|login|security|approval|rate limit)/i,
  /delete (files|records|data)/i,
  /access all gmail/i,
];

export function detectPromptInjection(input: string) {
  const matches = suspiciousPatterns.filter((pattern) => pattern.test(input));
  return {
    hasRisk: matches.length > 0,
    warnings: matches.map((pattern) => `Matched unsafe instruction pattern: ${pattern.source}`),
  };
}

export function wrapUntrustedContent(label: string, content: string) {
  return `<untrusted_${label}>\n${content}\n</untrusted_${label}>`;
}
