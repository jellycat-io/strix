import dynamic from "next/dynamic";

import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

import { ComposeButton } from "./_components/compose-button";

const MailDashboard = dynamic(() =>
  import("./_components/mail-dashboard").then((mod) => mod.MailDashboard),
);

export default async function MailPage() {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2">
          <UserButton />
          <ThemeToggle />
          <ComposeButton />
        </div>
      </div>
      <div className="hidden h-screen flex-col overflow-scroll md:flex">
        <MailDashboard navCollapsedSize={2} />
      </div>
    </>
  );
}
