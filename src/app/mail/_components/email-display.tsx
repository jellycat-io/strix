"use client";

import { formatDistanceToNow } from "date-fns";
import Avatar from "react-avatar";
import { Letter } from "react-letter";

import { useThreads } from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/react";

interface EmailDisplayProps {
  email: RouterOutputs["mail"]["getThreads"][0]["emails"][0];
}

export function EmailDisplay({ email }: EmailDisplayProps) {
  const { account } = useThreads();

  const isMe = account?.email === email.from.address;

  return (
    <div
      className={cn(
        "rounded-md border p-4 transition-all hover:translate-x-2",
        isMe && "border-l-4 border-l-primary",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round
            />
          )}
          <span className="font-medium">
            {isMe ? "Me" : (email.from.name ?? email.from.address)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(email.sentAt ?? new Date(), { addSuffix: true })}
        </p>
      </div>
      <div className="h-4"></div>
      <Letter
        html={email.body ?? ""}
        className="rounded-md bg-white p-4 text-black"
      />
    </div>
  );
}
