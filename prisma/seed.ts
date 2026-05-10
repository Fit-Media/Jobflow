import { PrismaClient } from "@prisma/client";

import { andrewProfile, baseResumeMarkdown, demoJobs } from "../src/lib/data/demo-data";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: andrewProfile.email },
    update: {},
    create: {
      name: andrewProfile.fullName,
      email: andrewProfile.email,
      profile: {
        create: {
          fullName: andrewProfile.fullName,
          email: andrewProfile.email,
          phone: andrewProfile.phone,
          location: andrewProfile.location,
          workRights: andrewProfile.workRights,
          preferredJobTitles: andrewProfile.preferredJobTitles,
          preferredLocations: andrewProfile.preferredLocations,
          certifications: [],
          skills: andrewProfile.skills,
          industries: [],
          summary: andrewProfile.summary,
        },
      },
      resumeSources: {
        create: {
          title: "Andrew base resume",
          type: "markdown",
          parsedText: baseResumeMarkdown,
          structuredJson: {},
          isDefault: true,
        },
      },
    },
  });

  for (const job of demoJobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        userId: user.id,
        title: job.title,
        company: job.company,
        recruiterName: job.recruiterName,
        recruiterEmail: job.recruiterEmail,
        sourcePlatform: job.source,
        originalJobUrl: job.originalJobUrl,
        savedJobDescription: job.jobDescriptionText,
        jobDescriptionText: job.jobDescriptionText,
        location: job.location,
        salary: job.salary,
        closingDate: new Date(job.closingDate),
        matchScore: job.matchScore,
        recommendation: job.recommendation,
        mustHaveCriteria: job.mustHaveCriteria,
        desirableCriteria: job.desirableCriteria,
        keywords: job.keywords,
        status: job.status,
        applications: {
          create: {
            userId: user.id,
            status: job.status,
            followUpDate: job.followUpDate ? new Date(job.followUpDate) : undefined,
            appliedAt: job.appliedAt ? new Date(job.appliedAt) : undefined,
            notes: job.notes,
          },
        },
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
