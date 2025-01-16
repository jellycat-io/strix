// import pLimit from "p-limit";
import type {
  EmailAddress,
  EmailAttachment,
  EmailLabel,
  EmailMessage,
} from "@/types";
import { db } from "@/server/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function syncEmailsToDatabase(
  accountId: string,
  emails: EmailMessage[],
) {
  console.log(`Attempting to sync ${emails.length} emails to database`);
  // const limit = pLimit(10);

  try {
    for (const [index, email] of emails.entries()) {
      await upsertEmail(email, index, accountId);
    }
  } catch (err) {
    console.error("Error syncing emails to database:", err);
  }
}

async function upsertEmail(
  email: EmailMessage,
  index: number,
  accountId: string,
) {
  console.log("Upserting email:", index + 1);

  try {
    let emailLabelType: EmailLabel = "inbox";
    if (
      email.sysLabels.includes("inbox") ||
      email.sysLabels.includes("important")
    ) {
      emailLabelType = "inbox";
    } else if (email.sysLabels.includes("sent")) {
      emailLabelType = "sent";
    } else if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    } else if (email.sysLabels.includes("junk")) {
      emailLabelType = "junk";
    }

    // 1. Upsert email addresses
    const addressesToUpsert = new Map<string, EmailAddress>();
    for (const address of [
      email.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ]) {
      addressesToUpsert.set(address.address, address);
    }

    const upsertedAddresses: Awaited<ReturnType<typeof upsertEmailAddress>>[] =
      [];

    for (const address of addressesToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        .map((address) => [address!.address, address]),
    );

    const fromAddress = addressMap.get(email.from.address);
    if (!fromAddress) {
      console.error(
        `Failed to upsert from address for email ${email.bodySnippet}`,
      );
      return;
    }

    const toAddresses = email.to
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const ccAddresses = email.cc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const bccAddresses = email.bcc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    // 2. Upsert thread
    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        junkStatus: emailLabelType === "junk",
        lastMessageDate: new Date(email.sentAt),
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });

    if (!thread) {
      console.error(`Failed to upsert thread for email ${email.bodySnippet}`);
      return;
    }

    // 3. Upsert email
    const emailData = {
      threadId: thread.id,
      createdTime: new Date(email.createdTime),
      lastModifiedTime: new Date(),
      sentAt: new Date(email.sentAt),
      receivedAt: new Date(email.receivedAt),
      internetMessageId: email.internetMessageId,
      subject: email.subject,
      sysLabels: email.sysLabels,
      keywords: email.keywords,
      sysClassifications: email.sysClassifications,
      sensitivity: email.sensitivity,
      meetingMessageMethod: email.meetingMessageMethod ?? null,
      fromId: fromAddress.id,
      hasAttachments: email.hasAttachments,
      internetHeaders: email.internetHeaders as any,
      body: email.body ?? null,
      bodySnippet: email.bodySnippet ?? null,
      inReplyTo: email.inReplyTo ?? null,
      references: email.references ?? null,
      threadIndex: email.threadIndex ?? null,
      nativeProperties: email.nativeProperties as any,
      folderId: email.folderId ?? null,
      omitted: email.omitted,
      emailLabel: emailLabelType,
    };

    await db.email.upsert({
      where: { id: email.id },
      update: {
        ...emailData,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
      },
      create: {
        ...emailData,
        id: email.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
      },
    });

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let threadFolderType = "sent";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break;
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft";
      } else if (threadEmail.emailLabel === "junk") {
        threadFolderType = "junk";
      }
    }

    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
        junkStatus: threadFolderType === "junk",
      },
    });

    // 5. Upsert attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      console.error(`Prisma error for email ${email.id}: ${err.message}`);
    } else {
      console.error(`Unknown error for email ${email.id}: ${err}`);
    }
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    const existingAddress = await db.emailAddress.findUnique({
      where: {
        accountId_address: { accountId, address: address.address ?? "" },
      },
    });

    if (existingAddress) {
      return await db.emailAddress.findUnique({
        where: { id: existingAddress.id },
      });
    } else {
      return await db.emailAddress.create({
        data: {
          address: address.address ?? "",
          name: address.name,
          raw: address.raw,
          accountId,
        },
      });
    }
  } catch (err) {
    console.error("Failed to upsert email address", err);
    return null;
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  const attachmentData = {
    name: attachment.name,
    mimeType: attachment.mimeType,
    size: attachment.size,
    inline: attachment.inline,
    contentId: attachment.contentId,
    content: attachment.content,
    contentLocation: attachment.contentLocation,
  };

  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: attachmentData,
      create: {
        id: attachment.id,
        emailId,
        ...attachmentData,
      },
    });
  } catch (err) {
    console.error(`Failed to upsert attachment for email ${emailId}: ${err}`);
  }
}
