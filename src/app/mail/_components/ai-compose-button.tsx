"use client";

import { useState } from "react";

import { readStreamableValue } from "ai/rsc";
import { BotIcon } from "lucide-react";

import { turndown } from "@/lib/turndown";
import { useThreads } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { generateEmail } from "../action";

interface AIComposeButtonProps {
  isComposing: boolean;
  onGenerate(token: string): void;
}

export function AIComposeButton({
  isComposing,
  onGenerate,
}: AIComposeButtonProps) {
  const { threadId, threads, account } = useThreads();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const thread = threads?.find((thread) => thread.id === threadId);

  async function handleGenerate() {
    let context = "";
    if (!isComposing) {
      for (const email of thread?.emails ?? []) {
        const content = `
          Subject: ${email.subject}
          From: ${email.from}
          SentAt: ${new Date(email.sentAt).toLocaleString()}
          Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
        `;
        context += content;
      }
      context += `
        My name is ${account?.name} and my email address is ${account?.email}
      `;
    }
    const { output } = await generateEmail(context, prompt);
    for await (const token of readStreamableValue(output)) {
      if (token) {
        onGenerate(token);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <BotIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>AI Smart Compose</DialogTitle>
        <DialogDescription>
          AI will help you compose your email.
        </DialogDescription>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt..."
          className="mt-2"
          rows={3}
        />
        <DialogFooter>
          <Button
            onClick={() => {
              setOpen(false);
              setPrompt("");
              handleGenerate();
            }}
          >
            <BotIcon className="size-4" />
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
