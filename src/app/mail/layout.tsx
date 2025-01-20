import { TooltipProvider } from "@/components/ui/tooltip";
import { KBar } from "@/components/kbar";

export default async function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KBar>
      <TooltipProvider>{children}</TooltipProvider>
    </KBar>
  );
}
