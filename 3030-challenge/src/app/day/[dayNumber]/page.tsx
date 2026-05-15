import { ParticipantApp } from "@/components/workbook/participant-app";
export default async function Page({ params }: { params: Promise<{ dayNumber: string }> }) {
  const { dayNumber } = await params;
  return <ParticipantApp view="day" dayNumber={Number(dayNumber)} />;
}
