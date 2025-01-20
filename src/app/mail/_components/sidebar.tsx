"use client";

import { api } from "@/trpc/react";
import { FileIcon, InboxIcon, SendIcon } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";

import { Nav } from "./nav";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const [accountId] = useLocalStorage("strix::accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "strix::tab",
    "inbox",
  );

  const { data: inboxCount, isFetching: isInboxCountFetching } =
    api.mail.getThreadCount.useQuery({
      accountId,
      tab: "inbox",
    });
  const { data: draftCount, isFetching: isDraftCountFetching } =
    api.mail.getThreadCount.useQuery({
      accountId,
      tab: "drafts",
    });
  const { data: sentCount, isFetching: isSentCountFetching } =
    api.mail.getThreadCount.useQuery({
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
          isLoading: isInboxCountFetching,
        },
        {
          title: "Drafts",
          label: draftCount?.toString() ?? "?",
          icon: FileIcon,
          variant: tab === "drafts" ? "default" : "ghost",
          isLoading: isDraftCountFetching,
        },
        {
          title: "Sent",
          label: sentCount?.toString() ?? "?",
          icon: SendIcon,
          variant: tab === "sent" ? "default" : "ghost",
          isLoading: isSentCountFetching,
        },
      ]}
    />
  );
}
