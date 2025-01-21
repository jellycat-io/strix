"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import { SendIcon, SquarePenIcon } from "lucide-react";
import { toast } from "sonner";

import { useThreads } from "@/hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SelectOption } from "@/components/multi-select";

import { EmailEditor } from "./email-editor";

export function ComposeButton() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [toValues, setToValues] = useState<SelectOption[]>([]);
  const [ccValues, setCcValues] = useState<SelectOption[]>([]);
  const [bccValues, setBccValues] = useState<SelectOption[]>([]);

  const { account } = useThreads();
  const sendEmail = api.mail.sendEmail.useMutation();

  function handleSend(value: string) {
    if (!account) return;

    console.log(toValues);

    sendEmail.mutate(
      {
        accountId: account.id,
        email: {
          threadId: undefined,
          subject: subject,
          body: value,
          from: { name: account.name ?? "Me", address: account.email },
          to: toValues.map(toEmailAddress),
          cc: ccValues.map(toEmailAddress),
          bcc: bccValues.map(toEmailAddress),
          replyTo: { name: account.name ?? "Me", address: account.email },
          inReplyTo: undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          toast.success("Email sent");
        },
        onError: (err) => {
          console.log(err);
          toast.error("Error sending email");
        },
      },
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <SquarePenIcon className="size-4" />
          Compose
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-3xl">
          <DrawerHeader>
            <DrawerTitle>Compose email</DrawerTitle>
          </DrawerHeader>
          <EmailEditor
            subject={subject}
            to={toValues.map((to) => to.value)}
            toValues={toValues}
            ccValues={ccValues}
            bccValues={bccValues}
            isDefaultExpanded
            isSending={sendEmail.isPending}
            setSubject={setSubject}
            setToValues={setToValues}
            setCcValues={setCcValues}
            setBccValues={setBccValues}
            handleSend={handleSend}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function toEmailAddress({ value }: SelectOption) {
  return {
    name: value,
    address: value,
  };
}
