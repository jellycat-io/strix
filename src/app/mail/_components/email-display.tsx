"use client";

import { type RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Letter } from "react-letter";

import { cn, getInitials } from "@/lib/utils";
import { useThreads } from "@/hooks/use-threads";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            <div className="text-sm">
              <Avatar>
                <AvatarImage alt={email.from.name ?? email.from.address} />
                <AvatarFallback>
                  {email.from.name ? getInitials(email.from.name) : "@"}
                </AvatarFallback>
              </Avatar>
            </div>
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
