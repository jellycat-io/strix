import dynamic from "next/dynamic";

const MailDashboard = dynamic(() =>
  import("./_components/mail-dashboard").then((mod) => mod.MailDashboard),
);

export default async function MailPage() {
  return (
    <div className="hidden h-screen flex-col overflow-scroll md:flex">
      <MailDashboard navCollapsedSize={2} />
    </div>
  );
}
