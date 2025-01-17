"use client";

import { useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MailProps {
  navCollapsedSize: number;
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
}

export function MailDashboard({
  navCollapsedSize,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        console.log(sizes);
      }}
      className="h-full min-h-screen items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={15}
        maxSize={40}
        onCollapse={() => setIsCollapsed(true)}
        onResize={() => {
          setIsCollapsed(false);
        }}
        className={cn(
          isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out",
        )}
      >
        <div className="flex h-full flex-1 flex-col">
          {/* Account Switcher */}
          <div
            className={cn(
              "flex h-[52px] items-center justify-between",
              isCollapsed ? "h-[52px]" : "px-2",
            )}
          >
            Account Switcher
          </div>
          <Separator />
          {/* Sidebar */}
          <div className="flex-1"></div>
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
          <TabsContent value="inbox">Inbox content</TabsContent>
          <TabsContent value="done">Done content</TabsContent>
        </Tabs>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
        Thread Display
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
