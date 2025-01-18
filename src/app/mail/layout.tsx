import { KBar } from "@/components/kbar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
