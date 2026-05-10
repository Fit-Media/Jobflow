export const microsoftScopes = ["openid", "email", "profile", "offline_access", "Files.ReadWrite"];

export function microsoftFolderName(company: string, jobTitle: string, date: string) {
  return `${company} - ${jobTitle} - ${date}`;
}

export function wordOnlineIntegrationStatus() {
  return {
    implemented: "service boundary",
    safety: "Uploads and exports require approved documents and explicit Andrew approval.",
    nextSteps: ["Create OneDrive folder", "Upload DOCX", "Return Word Online edit link", "Export approved PDF where available"],
  };
}
