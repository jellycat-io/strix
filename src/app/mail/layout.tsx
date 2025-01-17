import { TooltipProvider } from "@/components/ui/tooltip";

export default async function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
