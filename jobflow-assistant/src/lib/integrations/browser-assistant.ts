export type FieldMapping = {
  label: string;
  value: string;
  risk: "low" | "medium" | "high";
  approved: boolean;
};

const finalSubmitPatterns = [/submit/i, /apply/i, /send/i, /confirm/i, /complete application/i];
const stopPatterns = [/captcha/i, /mfa/i, /multi-factor/i, /login/i, /sign in/i, /declaration/i, /attest/i];

export function classifyBrowserControl(text: string) {
  if (stopPatterns.some((pattern) => pattern.test(text))) {
    return { action: "stop", reason: "Login, CAPTCHA, MFA, or legal declaration detected." };
  }
  if (finalSubmitPatterns.some((pattern) => pattern.test(text))) {
    return { action: "block_final_submit", reason: "Only Andrew can click the final Submit/Apply/Send/Confirm button." };
  }
  return { action: "safe_to_suggest", reason: "Field can be mapped only after approval." };
}

export function approvedFieldMappingsOnly(mappings: FieldMapping[]) {
  return mappings.filter((mapping) => mapping.approved);
}

export function guidedApplyFinalNotice() {
  return "Review everything carefully. JobFlow Assistant will not submit this application. Only Andrew can click the final Submit/Apply button.";
}
