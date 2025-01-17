import dynamic from "next/dynamic";

const MailDashboard = dynamic(() =>
  import("./_components/mail-dashboard").then((mod) => mod.MailDashboard),
);

export default async function MailPage() {
  return <MailDashboard navCollapsedSize={2} />;
}
