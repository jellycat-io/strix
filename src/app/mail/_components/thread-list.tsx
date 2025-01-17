"use client";

import { format, formatDistanceToNow } from "date-fns";
import DomPurify from "dompurify";
import { type ComponentProps, Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { useThreads } from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function ThreadList() {
  const { threadId, setThreadId, threads, isFetching } = useThreads();

  const groupedThreads = threads?.reduce(
    (acc, thread) => {
      const date = format(
        thread.emails[0]?.sentAt ?? new Date(),
        "yyyy MMMM dd",
      );
      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(thread);

      return acc;
    },
    {} as Record<string, typeof threads>,
  );

  if (isFetching)
    return (
      <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
        <div className="flex flex-col gap-2 p-4 pt-0">
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => (
          <Fragment key={date}>
            <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
              {date}
            </div>
            {threads.map((thread) => (
              <button
                key={thread.id}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  thread.id === threadId && "bg-accent text-accent-foreground",
                )}
                onClick={() => setThreadId(thread.id)}
              >
                <div className="flex w-full flex-col gap-2">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {thread.emails.at(-1)?.from.name ??
                          thread.emails.at(-1)?.from.address}
                      </div>
                    </div>
                    <div className={cn("ml-auto text-xs")}>
                      {formatDistanceToNow(
                        thread.emails.at(-1)?.sentAt ?? new Date(),
                        { addSuffix: true },
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{thread.subject}</div>
                </div>
                <div
                  className="line-clamp-2 text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: DomPurify.sanitize(
                      thread.emails.at(-1)?.bodySnippet ?? "",
                      { USE_PROFILES: { html: true } },
                    ),
                  }}
                />
                {thread.emails[0]?.sysLabels.length && (
                  <div className="flex items-center gap-2">
                    {thread.emails[0].sysLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  return ["work"].includes(label.toLowerCase()) ? "default" : "secondary";
}
