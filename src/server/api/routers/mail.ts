import { threadId } from "worker_threads";

import { db } from "@/server/db";
import { emailAddressSchema } from "@/types";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { Account } from "@/lib/account";

import { createTRPCRouter, privateProcedure } from "../trpc";

const Tab = z.enum(["inbox", "drafts", "sent"]);

export async function checkAccountAccess(accountId: string, userId: string) {
  const account = await db.account.findFirst({
    where: { id: accountId, userId },
    select: {
      id: true,
      email: true,
      name: true,
      accessToken: true,
    },
  });

  if (!account) throw new Error("Account not found");

  return account;
}

function inboxFilter(accountId: string): Prisma.ThreadWhereInput {
  return {
    accountId,
    inboxStatus: true,
  };
}

function draftFilter(accountId: string): Prisma.ThreadWhereInput {
  return {
    accountId,
    draftStatus: true,
  };
}

function sentFilter(accountId: string): Prisma.ThreadWhereInput {
  return {
    accountId,
    sentStatus: true,
  };
}

export const mailRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: { userId: ctx.auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }),

  getThreadCount: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: Tab,
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await checkAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter = inboxFilter(account.id);
      } else if (input.tab === "drafts") {
        filter = draftFilter(account.id);
      } else if (input.tab === "sent") {
        filter = sentFilter(account.id);
      }

      return await ctx.db.thread.count({
        where: filter,
      });
    }),

  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: Tab,
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await checkAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      let filter: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filter = inboxFilter(account.id);
      } else if (input.tab === "drafts") {
        filter = draftFilter(account.id);
      } else if (input.tab === "sent") {
        filter = sentFilter(account.id);
      }

      filter.done = {
        equals: input.done,
      };

      return await ctx.db.thread.findMany({
        where: filter,
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              id: true,
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              subject: true,
              sysLabels: true,
              sentAt: true,
            },
          },
        },
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),

  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await checkAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const thread = await ctx.db.thread.findFirst({
        where: {
          accountId: account.id,
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });

      if (!thread || thread.emails.length === 0) {
        throw new Error("Thread not found");
      }

      const lastExternalEmail = thread.emails
        .reverse()
        .find((email) => email.from.address !== account.email);
      if (!lastExternalEmail) {
        throw new Error("No external email found");
      }

      return {
        subject: lastExternalEmail.subject,
        to: [
          lastExternalEmail.from,
          ...lastExternalEmail.to.filter((to) => to.address !== account.email),
        ],
        cc: lastExternalEmail.cc.filter((cc) => cc.address !== account.email),
        bcc: lastExternalEmail.bcc.filter(
          (bcc) => bcc.address !== account.email,
        ),
        from: { name: account.name, address: account.email },
        id: lastExternalEmail.internetMessageId,
      };
    }),

  getSuggestions: privateProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await checkAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          id: true,
          address: true,
          name: true,
        },
      });
    }),

  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        email: z.object({
          threadId: z.string().optional(),
          subject: z.string(),
          body: z.string(),
          from: emailAddressSchema,
          to: z.array(emailAddressSchema),
          cc: z.array(emailAddressSchema).optional(),
          bcc: z.array(emailAddressSchema).optional(),
          replyTo: emailAddressSchema.optional(),
          inReplyTo: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await checkAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);
      await acc.sendEmail(input.email);
    }),
});
