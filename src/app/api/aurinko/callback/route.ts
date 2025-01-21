// /api/aurinko/callback
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success") {
    return NextResponse.json(
      { error: "Failed to link account" },
      { status: 400 },
    );
  }

  // Get the code to exchange for the access token
  const code = params.get("code");
  if (!code) {
    return NextResponse.json({ error: "Node code provided" }, { status: 400 });
  }

  const token = await exchangeCodeForAccessToken(code);
  if (!token) {
    return NextResponse.json(
      { error: "Failed to exchange code for access token" },
      { status: 400 },
    );
  }

  const account = await getAccountDetails(token.accessToken);
  if (!account) {
    return NextResponse.json(
      { error: "Failed to get account details" },
      { status: 400 },
    );
  }

  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      email: account.email,
      name: account.name,
      accessToken: token.accessToken,
    },
  });

  // Trigger initial sync
  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .then((res) => console.log("Initial sync triggered:", res.data))
      .catch((err) => console.error("Failed to trigger initial sync:", err)),
  );

  return NextResponse.redirect(
    new URL(`/mail?accountId=${token.accountId}`, req.url),
  );
};
