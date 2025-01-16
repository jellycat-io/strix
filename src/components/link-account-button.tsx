"use client";

import { CableIcon, Link2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

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
