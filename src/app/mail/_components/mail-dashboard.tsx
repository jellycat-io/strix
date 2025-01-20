"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AccountSwitcher } from "./account-switcher";
import { Sidebar } from "./sidebar";
import { ThreadDisplay } from "./thread-display";
import { ThreadList } from "./thread-list";

interface MailProps {
  navCollapsedSize: number;
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
}

export function MailDashboard({
  navCollapsedSize,
  defaultLayout = [10, 32, 58],
  defaultCollapsed = false,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`;
      }}
      className="h-full min-h-screen items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={10}
        maxSize={40}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
        }}
        onResize={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
        }}
        className={cn(
          isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        <div className="flex h-full flex-1 flex-col">
          <div className={cn("flex h-[52px] items-center justify-center px-2")}>
            <AccountSwitcher isCollapsed={isCollapsed} />
          </div>
          <Separator />
          {/* Sidebar */}
          <div className="flex-1">
            <Sidebar isCollapsed={isCollapsed} />
          </div>
          {/* AI */}
          Ask AI
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        <Tabs defaultValue="inbox">
          <div className="flex items-center px-4 py-2">
            <h2 className="text-xl font-bold">Inbox</h2>
            <TabsList className="ml-auto">
              <TabsTrigger
                value="inbox"
                className="text-zinc-600 dark:text-zinc-200"
              >
                Inbox
              </TabsTrigger>
              <TabsTrigger
                value="done"
                className="text-zinc-600 dark:text-zinc-200"
              >
                Done
              </TabsTrigger>
            </TabsList>
          </div>
          <Separator />
          {/* Search bar */}
          Search Bar
          <TabsContent value="inbox">
            <ThreadList />
          </TabsContent>
          <TabsContent value="done">
            <ThreadList />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
        <ThreadDisplay />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
