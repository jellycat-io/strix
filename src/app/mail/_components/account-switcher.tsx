"use client";

import { api } from "@/trpc/react";
import { PlusIcon } from "lucide-react";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const { data: accounts } = api.mail.getAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage("strix::accountId", "");

  if (!accounts) return <Skeleton className="h-9 w-full" />;

  return (
    <div className="flex w-full items-center gap-2">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn(!isCollapsed && "hidden")}>
              {accounts
                .find((account) => account.id === accountId)
                ?.name.split(" ")
                .map((w) => w.charAt(0))
                .join("")
                .toUpperCase()}
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {accounts.find((account) => account.id === accountId)?.name}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <span className="mr-2">{account.name}</span>
              <span className="text-muted-foreground">{account.email}</span>
            </SelectItem>
          ))}
          <div
            className="flex items-center gap-1 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={async () => {
              const authUrl = await getAurinkoAuthUrl("Google");
              window.location.href = authUrl;
            }}
          >
            <PlusIcon className="size-4" />
            Add Account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
