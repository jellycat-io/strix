// /api/aurinko/callback

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success") {
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );
  }

  // Get the code to exchange for the access token
  const code = params.get("code");
  if (!code) {
    return NextResponse.json(
      { message: "Node code provided" },
      { status: 400 },
    );
  }

  const token = await exchangeCodeForAccessToken(code);
  if (!token) {
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );
  }

  const account = await getAccountDetails(token.accessToken);
  if (!account) {
    return NextResponse.json(
      { message: "Failed to get account details" },
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

  return NextResponse.redirect(new URL("/mail", req.url));
};
