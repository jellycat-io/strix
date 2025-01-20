"use client";

import { format } from "date-fns";
import {
  ArchiveIcon,
  ArchiveXIcon,
  ClockIcon,
  MoreVerticalIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import { useThreads } from "@/hooks/use-threads";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { EmailDisplay } from "./email-display";
import { ReplyBox } from "./reply-box";

interface ThreadTool {
  label: string;
  icon: LucideIcon;
  handler: () => void;
}

const tools: Record<string, ThreadTool[]> = {
  first: [
    { label: "Archive", icon: ArchiveIcon, handler: () => {} },
    { label: "Unarchive", icon: ArchiveXIcon, handler: () => {} },
    { label: "Delete", icon: Trash2Icon, handler: () => {} },
  ],
  second: [{ label: "Snooze", icon: ClockIcon, handler: () => {} }],
};

export function ThreadDisplay() {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          {tools.first?.map((tool) => (
            <ThreadToolButton
              key={tool.label}
              tool={tool}
              isDisabled={!thread}
            />
          ))}
        </div>
        <Separator orientation="vertical" className="mx-2" />
        {tools.second?.map((tool) => (
          <ThreadToolButton key={tool.label} tool={tool} isDisabled={!thread} />
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!thread}
              className="ml-auto"
            >
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {threadId ? (
        <div className="flex flex-1 flex-col overflow-scroll">
          <div className="flex items-center p-4">
            <div className="flex items-center gap-4 text-sm">
              <Avatar>
                <AvatarImage alt="avatar" />
                <AvatarFallback>
                  {thread?.emails[0]?.from.name
                    ? getInitials(thread.emails[0]?.from.name)
                    : "@"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="flex flex-col gap-1 font-semibold">
                  {thread?.emails[0]?.from.name ??
                    thread?.emails[0]?.from.address}
                  <div className="line-clamp-1 text-xs">
                    {thread?.emails[0]?.subject}
                  </div>
                  <div className="line-clamp-1 text-xs">
                    <span className="mr-1 font-medium">Reply-To:</span>
                    {thread?.emails[0]?.from.address}
                  </div>
                </div>
              </div>
            </div>
            {thread?.emails[0]?.sentAt && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(thread.emails[0].sentAt), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll">
            <div className="flex flex-col gap-4 p-6">
              {thread?.emails.map((email) => (
                <EmailDisplay key={email.id} email={email} />
              ))}
            </div>
          </div>
          <div className="flex-1"></div>
          <Separator className="mt-auto" />
          <ReplyBox />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}

interface ToolButtonProps {
  tool: ThreadTool;
  isDisabled?: boolean;
}

function ThreadToolButton({ tool, isDisabled }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDisabled}
          onClick={tool.handler}
        >
          <tool.icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tool.label}</TooltipContent>
    </Tooltip>
  );
}
