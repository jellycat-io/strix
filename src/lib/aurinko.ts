"use server";

import axios, { isAxiosError } from "axios";
import { auth } from "@clerk/nextjs/server";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const res = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID!,
          password: process.env.AURINKO_CLIENT_SECRET!,
        },
      },
    );

    return res.data as {
      accountId: string;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(
        err.response?.data.error ||
          `Failed to exchange code for access token: ${err}`,
      );
    }
    console.error("Failed to exchange code for access token:", err);
  }
};

export const getAccountDetails = async (token: string) => {
  try {
    const res = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data as {
      email: string;
      name: string;
    };
  } catch (err) {
    if (isAxiosError(err)) {
      console.error(
        err.response?.data.error || `Failed to get account details: ${err}`,
      );
    }
    console.error("Failed to get account details:", err);
  }
};
