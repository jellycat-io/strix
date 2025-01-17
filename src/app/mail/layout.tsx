import { TooltipProvider } from "@/components/ui/tooltip";

export default async function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
