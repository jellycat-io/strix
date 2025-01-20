"use client";

import { CableIcon } from "lucide-react";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { Button } from "@/components/ui/button";

export const LinkAccountButton = () => {
  return (
    <Button
      onClick={async () => {
        const authUrl = await getAurinkoAuthUrl("Google");
        window.location.href = authUrl;
      }}
    >
      <CableIcon className="size-4" />
      Link Account
    </Button>
  );
};
