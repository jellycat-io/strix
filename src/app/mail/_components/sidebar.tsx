"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Nav } from "./nav";
import { FileIcon, InboxIcon, SendIcon } from "lucide-react";
import { api } from "@/trpc/react";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const [accountId] = useLocalStorage("strix::accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "strix::tab",
    "inbox",
  );

  const { data: inboxCount } = api.mail.getThreadCount.useQuery({
    accountId,
    tab: "inbox",
  });
  const { data: draftCount } = api.mail.getThreadCount.useQuery({
    accountId,
    tab: "drafts",
  });
  const { data: sentCount } = api.mail.getThreadCount.useQuery({
    accountId,
    tab: "sent",
  });

  return (
    <Nav
      isCollapsed={isCollapsed}
      links={[
        {
          title: "Inbox",
          label: inboxCount?.toString() ?? "?",
          icon: InboxIcon,
          variant: tab === "inbox" ? "default" : "ghost",
        },
        {
          title: "Drafts",
          label: draftCount?.toString() ?? "?",
          icon: FileIcon,
          variant: tab === "drafts" ? "default" : "ghost",
        },
        {
          title: "Sent",
          label: sentCount?.toString() ?? "?",
          icon: SendIcon,
          variant: tab === "sent" ? "default" : "ghost",
        },
      ]}
    />
  );
}
