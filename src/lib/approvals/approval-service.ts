export type ApprovalDecision = "approved" | "rejected" | "edited";

export type ApprovalRequest = {
  userId: string;
  jobId?: string;
  type: string;
  title: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  proposedDataJson?: unknown;
};

export function createApprovalRequest(request: ApprovalRequest) {
  return {
    ...request,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
}

export function decideApproval(request: ApprovalRequest, decision: ApprovalDecision, approvedDataJson?: unknown) {
  return {
    approval: {
      ...request,
      status: decision,
      approvedDataJson: decision === "approved" || decision === "edited" ? approvedDataJson : null,
      updatedAt: new Date().toISOString(),
    },
    auditLog: {
      userId: request.userId,
      jobId: request.jobId,
      action: `APPROVAL_${decision.toUpperCase()}`,
      detail: `${request.title}: ${decision}`,
      metadataJson: { type: request.type, riskLevel: request.riskLevel },
      createdAt: new Date().toISOString(),
    },
  };
}
