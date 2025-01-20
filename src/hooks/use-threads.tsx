"use client";

import { api } from "@/trpc/react";
import { atom, useAtom } from "jotai";

import { useLocalStorage } from "./use-local-storage";

export const threadIdAtom = atom<string | null>(null);

export function useThreads() {
  const { data: accounts } = api.mail.getAccounts.useQuery();
  const [accountId] = useLocalStorage("strix::accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "strix::tab",
    "inbox",
  );
  const [done] = useLocalStorage("strix::done", false);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

  const {
    data: threads,
    isFetching,
    refetch,
  } = api.mail.getThreads.useQuery(
    {
      accountId,
      tab,
      done,
    },
    {
      enabled: !!accountId && !!tab,
      placeholderData: (e) => e,
      // refetchInterval: 5000
    },
  );

  return {
    threadId,
    setThreadId,
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find((a) => a.id === accountId),
  };
}
