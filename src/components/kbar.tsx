"use client";

import { motion } from "framer-motion";
import {
  type Action,
  type ActionId,
  type ActionImpl,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
} from "kbar";
import { forwardRef, Fragment, type Ref, useMemo } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useThemeSwitching } from "@/hooks/use-theme-switching";

export function KBar({ children }: { children: React.ReactNode }) {
  const [_, setTab] = useLocalStorage("strix::tab", "inbox");

  const actions: Action[] = [
    {
      id: "inboxAction",
      name: "Inbox",
      shortcut: ["g", "i"],
      section: "Navigation",
      subtitle: "View your inbox",
      perform: () => {
        setTab("inbox");
      },
    },
    {
      id: "draftAction",
      name: "Drafts",
      shortcut: ["g", "d"],
      section: "Navigation",
      subtitle: "View your draft messages",
      perform: () => {
        setTab("drafts");
      },
    },
    {
      id: "sentAction",
      name: "Sent",
      shortcut: ["g", "s"],
      section: "Navigation",
      subtitle: "View your sent messages",
      perform: () => {
        setTab("sent");
      },
    },
  ];
  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}

function KBarComponent({ children }: { children: React.ReactNode }) {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-50 bg-black/40 p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="relative mt-64 w-full max-w-[600px] -translate-y-1/2 overflow-hidden rounded-md border bg-popover text-popover-foreground">
            <KBarSearch className="flex h-12 w-full rounded-md bg-transparent p-3 text-sm text-popover-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
            <div className="pb-2">
              <KBarResultsWrapper />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
}

function KBarResultsWrapper() {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === "string") {
          return (
            <div className="border-t px-4 py-2 text-sm text-muted-foreground">
              {item}
            </div>
          );
        }

        return (
          <KBarResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ""}
          />
        );
      }}
    />
  );
}

const KBarResultItem = forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl;
      active: boolean;
      currentRootActionId: ActionId;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const ancestors = useMemo(() => {
      if (!currentRootActionId) return action.ancestors;
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      );
      return action.ancestors.slice(index + 1);
    }, [action.ancestors, currentRootActionId]);

    return (
      <div
        ref={ref}
        className="relative flex cursor-pointer items-center justify-between px-4 py-2"
      >
        {active && (
          <motion.div
            layoutId="kbar-result-item"
            className="absolute inset-0 z-[-1] border-l-4 border-primary"
            transition={{
              duration: 0.14,
              type: "spring",
            }}
          />
        )}
        <div className="relative flex items-center gap-2">
          {action.icon && action.icon}
          <div className="flex flex-col">
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <Fragment key={ancestor.id}>
                    <span className="mr-2 opacity-50">{ancestor.name}</span>
                    <span className="mr-2">&rsaquo;</span>
                  </Fragment>
                ))}
              <span className="text-sm">{action.name}</span>
            </div>
            {action.subtitle && (
              <span className="text-xs text-muted-foreground">
                {action.subtitle}
              </span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div className="grid grid-flow-col gap-1">
            {action.shortcut.map((sc, index) => (
              <kbd
                key={`sk-${sc}-${index}`}
                className="flex size-6 items-center justify-center gap-1 rounded-md border bg-secondary text-xs font-medium text-secondary-foreground shadow"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);

KBarResultItem.displayName = "KBarResultItem";
