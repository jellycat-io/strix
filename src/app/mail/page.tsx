import dynamic from "next/dynamic";

import { ThemeToggle } from "@/components/theme-toggle";

const MailDashboard = dynamic(() =>
  import("./_components/mail-dashboard").then((mod) => mod.MailDashboard),
);

export default async function MailPage() {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <ThemeToggle />
      </div>
      <div className="hidden h-screen flex-col overflow-scroll md:flex">
        <MailDashboard navCollapsedSize={2} />
      </div>
    </>
  );
}
