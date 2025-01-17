// /api/initial-sync

import { type NextRequest, NextResponse } from "next/server";

import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId) {
    return NextResponse.json(
      { error: "Missing accountId or userId" },
      { status: 400 },
    );
  }

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!dbAccount) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Perform initial sync
  const account = new Account(dbAccount.accessToken);
  const res = await account.performInitialSync();
  if (!res) {
    return NextResponse.json(
      { error: "Failed to perform initial sync" },
      { status: 500 },
    );
  }
  const { emails, deltaToken } = res;

  await db.account.update({
    where: {
      id: accountId,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncEmailsToDatabase(accountId, emails);

  return NextResponse.json({ success: true }, { status: 200 });
};
