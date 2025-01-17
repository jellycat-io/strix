import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";

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
});
