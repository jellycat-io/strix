"use client";

import { useState } from "react";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Text from "@tiptap/extension-text";
import { Button } from "@/components/ui/button";
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
  LucideIcon,
  QuoteIcon,
  RedoIcon,
  SendIcon,
  StrikethroughIcon,
  UndoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { MultiSelect, SelectOption } from "@/components/multi-select";
import { api } from "@/trpc/react";
import { useThreads } from "@/hooks/use-threads";
import { Input } from "@/components/ui/input";

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
  handleSend(value: string): Promise<void>;
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

  const { accountId } = useThreads();
  const { data: suggestions } = api.mail.getSuggestions.useQuery({ accountId });

  const CustomText = Text.configure({
    addKeyboardShortcuts() {
      return {
        "Meta-.": () => {
          console.log("Meta-.");
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        text: false,
      }),
      CustomText,
    ],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  const options =
    suggestions?.map((s) => ({
      label: s.name ?? s.address,
      value: s.address,
    })) ?? [];

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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="font-medium text-green-600">Draft&nbsp;</span>
            <span>to</span>
            <span>{to.join(", ")}</span>
          </Button>
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
            await handleSend(value);
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
