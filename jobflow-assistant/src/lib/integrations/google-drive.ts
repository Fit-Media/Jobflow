export const googleDriveScopes = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
];

export function googleJobFolderName(company: string, jobTitle: string, date: string) {
  return `${company} - ${jobTitle} - ${date}`;
}

export function googleDocumentNames(company: string, jobTitle: string, date: string) {
  return {
    resume: `Andrew Resume - ${company} - ${jobTitle} - ${date}`,
    coverLetter: `Andrew Cover Letter - ${company} - ${jobTitle} - ${date}`,
  };
}

export function googleDocsIntegrationStatus() {
  return {
    implemented: "service boundary",
    nextSteps: [
      "Create JobFlow Assistant Drive folder.",
      "Create job subfolder.",
      "Create Google Docs from approved markdown.",
      "Export approved Google Docs to PDF.",
    ],
  };
}
