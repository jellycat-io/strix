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
  const [formState, setFormState] = useState<{
    subject: string;
    toValues: SelectOption[];
    ccValues: SelectOption[];
    bccValues: SelectOption[];
  }>({
    subject: "",
    toValues: [],
    ccValues: [],
    bccValues: [],
  });

  const { account } = useThreads();
  const sendEmail = api.mail.sendEmail.useMutation();

  function onSubjectChange(value: string) {
    setFormState({
      ...formState,
      subject: value,
    });
  }

  function onToValuesChange(values: SelectOption[]) {
    setFormState({
      ...formState,
      toValues: values,
    });
  }

  function onCcValuesChange(values: SelectOption[]) {
    setFormState({
      ...formState,
      ccValues: values,
    });
  }

  function onBccValuesChange(values: SelectOption[]) {
    setFormState({
      ...formState,
      bccValues: values,
    });
  }

  function handleSend(value: string) {
    if (!account) return;

    sendEmail.mutate(
      {
        accountId: account.id,
        email: {
          threadId: undefined,
          subject: formState.subject,
          body: value,
          from: { name: account.name ?? "Me", address: account.email },
          to: formState.toValues.map(toEmailAddress),
          cc: formState.ccValues.map(toEmailAddress),
          bcc: formState.bccValues.map(toEmailAddress),
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
            subject={formState.subject}
            to={formState.toValues.map((to) => to.value)}
            toValues={formState.toValues}
            ccValues={formState.ccValues}
            bccValues={formState.bccValues}
            isDefaultExpanded
            isSending={sendEmail.isPending}
            setSubject={onSubjectChange}
            setToValues={onToValuesChange}
            setCcValues={onCcValuesChange}
            setBccValues={onBccValuesChange}
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
