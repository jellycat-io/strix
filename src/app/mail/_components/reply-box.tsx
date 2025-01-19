"use client";

import { api, RouterOutputs } from "@/trpc/react";
import { EmailEditor } from "./email-editor";
import { useThreads } from "@/hooks/use-threads";
import { useEffect, useState } from "react";

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

  const { threadId } = useThreads();

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

  async function handleSend(value: string) {
    console.log(value);
  }

  return (
    <EmailEditor
      subject={subject}
      to={replyDetails.to.map((to) => to.address)}
      toValues={toValues}
      ccValues={ccValues}
      bccValues={bccValues}
      isSending={false}
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
