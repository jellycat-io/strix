"use client";

import { useState } from "react";

import { SendIcon, SquarePenIcon } from "lucide-react";

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

  async function handleSend(value: string) {
    console.log(value);
  }

  return (
    <Drawer>
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
            isSending={false}
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
