"use client";

import { useEffect, useState } from "react";

import { api, RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";

import { useThreads } from "@/hooks/use-threads";

import { EmailEditor } from "./email-editor";

export function ReplyBox() {
  const { accountId, threadId } = useThreads();
  const { data: replyDetails } = api.mail.getReplyDetails.useQuery({
    accountId,
    threadId: threadId ?? "",
  });

  if (!replyDetails) return null;

  return <ReplyBoxComponent replyDetails={replyDetails} />;
}

interface ReplyBoxComponentProps {
  replyDetails: RouterOutputs["mail"]["getReplyDetails"];
}

function ReplyBoxComponent({ replyDetails }: ReplyBoxComponentProps) {
  const [subject, setSubject] = useState(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );
  const [toValues, setToValues] = useState(replyDetails.to.map(toSelectOption));
  const [ccValues, setCcValues] = useState(replyDetails.cc.map(toSelectOption));
  const [bccValues, setBccValues] = useState(
    replyDetails.bcc.map(toSelectOption),
  );

  const { accountId, threadId } = useThreads();
  const sendEmail = api.mail.sendEmail.useMutation();

  useEffect(() => {
    if (!threadId || !replyDetails) return;
    setSubject(
      replyDetails.subject.startsWith("Re:")
        ? replyDetails.subject
        : `Re: ${replyDetails.subject}`,
    );
    setToValues(replyDetails.to.map(toSelectOption));
    setCcValues(replyDetails.cc.map(toSelectOption));
    setBccValues(replyDetails.bcc.map(toSelectOption));
  }, [threadId, replyDetails]);

  function handleSend(value: string) {
    if (!replyDetails) return;

    sendEmail.mutate(
      {
        accountId,
        email: {
          threadId: threadId ?? undefined,
          subject,
          body: value,
          from: replyDetails.from,
          to: replyDetails.to.map(toEmailAddress),
          cc: replyDetails.cc.map(toEmailAddress),
          bcc: replyDetails.bcc.map(toEmailAddress),
          replyTo: replyDetails.from,
          inReplyTo: replyDetails.id,
        },
      },

      {
        onSuccess: () => {
          toast.success("Reply sent");
        },
        onError: (err) => {
          console.log(err);
          toast.error("Error sending reply");
        },
      },
    );
  }

  return (
    <EmailEditor
      subject={subject}
      to={replyDetails.to.map((to) => to.address)}
      toValues={toValues}
      ccValues={ccValues}
      bccValues={bccValues}
      isSending={sendEmail.isPending}
      setSubject={setSubject}
      setToValues={setToValues}
      setCcValues={setCcValues}
      setBccValues={setBccValues}
      handleSend={handleSend}
    />
  );
}

function toSelectOption({
  name,
  address,
}: {
  name: string | null;
  address: string;
}) {
  return { label: name ?? address, value: address };
}

function toEmailAddress(
  value: RouterOutputs["mail"]["getReplyDetails"]["to"][0],
) {
  return {
    name: value.name ?? "",
    address: value.address,
  };
}
