"use client";

import { useEffect, useState } from "react";

import { api } from "@/trpc/react";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { readStreamableValue } from "ai/rsc";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Loader2Icon,
  QuoteIcon,
  RedoIcon,
  SendIcon,
  StrikethroughIcon,
  UndoIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useThreads } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MultiSelect, SelectOption } from "@/components/multi-select";

import { generate } from "../action";
import { AIComposeButton } from "./ai-compose-button";

interface EmailEditorProps {
  subject: string;
  to: string[];
  toValues: SelectOption[];
  ccValues: SelectOption[];
  bccValues: SelectOption[];
  isSending: boolean;
  isDefaultExpanded?: boolean;
  setSubject(value: string): void;
  setToValues(value: SelectOption[]): void;
  setCcValues(value: SelectOption[]): void;
  setBccValues(value: SelectOption[]): void;
  handleSend(value: string): void;
}

export function EmailEditor({
  subject,
  to,
  toValues,
  ccValues,
  bccValues,
  isSending,
  isDefaultExpanded = false,
  setSubject,
  setToValues,
  setCcValues,
  setBccValues,
  handleSend,
}: EmailEditorProps) {
  const [value, setValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
  const [token, setToken] = useState("");

  const { accountId } = useThreads();
  const { data: suggestions } = api.mail.getSuggestions.useQuery({ accountId });

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Mod-.": () => {
          autoComplete(this.editor.getText());
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    immediatelyRender: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  const options =
    suggestions?.map((s) => ({
      label: s.name ?? s.address,
      value: s.address,
    })) ?? [];

  useEffect(() => {
    editor?.commands.insertContent(token);
  }, [editor, token]);

  async function autoComplete(input: string) {
    const { output } = await generate(input);

    for await (const token of readStreamableValue(output)) {
      if (token) {
        setToken(token);
      }
    }
  }

  function onGenerateEmail(token: string) {
    editor?.commands.insertContent(token);
  }

  if (!editor) return null;

  return (
    <>
      <div className="p-2">
        <EditorToolBar editor={editor} />
      </div>
      <Separator />
      <div className="space-y-2 p-4 pb-0">
        {isExpanded && (
          <>
            <div className="flex items-center gap-2">
              <Label className="min-w-14">To</Label>
              <MultiSelect
                options={options}
                value={toValues}
                onChangeAction={setToValues}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="min-w-14">Cc</Label>
              <MultiSelect
                options={options}
                value={ccValues}
                onChangeAction={setCcValues}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="min-w-14">Bcc</Label>
              <MultiSelect
                options={options}
                value={bccValues}
                onChangeAction={setBccValues}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="min-w-14">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-1">
              <span className="font-medium text-green-600">Draft&nbsp;</span>
              <span>to</span>
              <span>{to.join(", ")}</span>
            </div>
          </Button>
          <AIComposeButton
            isComposing={isDefaultExpanded}
            onGenerate={onGenerateEmail}
          />
        </div>
      </div>
      <div className="prose w-full p-4">
        <EditorContent editor={editor} value={value} />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Tip: Press</span>
          <kbd className="flex size-6 items-center justify-center rounded-md bg-accent font-semibold text-accent-foreground">
            ⌘
          </kbd>
          <span>+</span>
          <kbd className="flex size-6 items-center justify-center rounded-md bg-accent font-semibold text-accent-foreground">
            .
          </kbd>
          <span>for AI autocomplete</span>
        </div>
        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            handleSend(value);
          }}
          disabled={isSending}
        >
          {isSending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon className="size-4" />
          )}
          Send
        </Button>
      </div>
    </>
  );
}

interface EditorToolBarProps {
  editor: Editor;
}
function EditorToolBar({ editor }: EditorToolBarProps) {
  return (
    <div className="flex flex-wrap">
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().toggleBold().run()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          editor.isActive("bold") && "bg-accent text-accent-foreground",
        )}
      >
        <BoldIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          editor.isActive("italic") && "bg-accent text-accent-foreground",
        )}
      >
        <ItalicIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          editor.isActive("strike") && "bg-accent text-accent-foreground",
        )}
      >
        <StrikethroughIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().toggleCode().run()}
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          editor.isActive("code") && "bg-accent text-accent-foreground",
        )}
      >
        <CodeIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          editor.isActive("heading", { level: 1 }) &&
            "bg-accent text-accent-foreground",
        )}
      >
        <Heading1Icon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          editor.isActive("heading", { level: 2 }) &&
            "bg-accent text-accent-foreground",
        )}
      >
        <Heading2Icon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          editor.isActive("heading", { level: 3 }) &&
            "bg-accent text-accent-foreground",
        )}
      >
        <Heading3Icon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          editor.isActive("bulletList") && "bg-accent text-accent-foreground",
        )}
      >
        <ListIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          editor.isActive("orderedList") && "bg-accent text-accent-foreground",
        )}
      >
        <ListOrderedIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          editor.isActive("blockquote") && "bg-accent text-accent-foreground",
        )}
      >
        <QuoteIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <UndoIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <RedoIcon className="size-4" />
      </Button>
    </div>
  );
}
