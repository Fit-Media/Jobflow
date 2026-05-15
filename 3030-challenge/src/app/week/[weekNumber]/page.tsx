import { ParticipantApp } from "@/components/workbook/participant-app";
export default async function Page({ params }: { params: Promise<{ weekNumber: string }> }) {
  const { weekNumber } = await params;
  return <ParticipantApp view="week" weekNumber={Number(weekNumber)} />;
}
