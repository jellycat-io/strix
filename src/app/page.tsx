import { Icons } from "@/components/icons";
// import { LinkAccountButton } from "@/components/link-account-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <main>
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_80%)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center pt-56">
        <h1 className="inline-block bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-center text-6xl font-bold text-transparent">
          The minimalistic, <br />
          AI-powered email client.
        </h1>
        <div className="h-4" />
        <p className="mb-8 max-w-xl text-center text-xl text-gray-600">
          Strix is a minimalistic, AI-powered email client that empowers you to
          manage your email with ease.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/mail">
            <Button>Get Started</Button>
          </Link>
          <Link href="https://github.com/jellycat-io/strix" target="_blank">
            <Button>
              <Icons.Github className="size-4" />
              View Code
            </Button>
          </Link>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Experience the power of:
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6 shadow-md">
              <h3 className="mb-2 text-xl font-semibold">
                AI-driven email RAG
              </h3>
              <p className="text-gray-600">
                Automatically prioritize your emails with our advanced AI
                system.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Full-text search</h3>
              <p className="text-gray-600">
                Quickly find any email with our powerful search functionality.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-md">
              <h3 className="mb-2 text-xl font-semibold">
                Shortcut-focused navigation
              </h3>
              <p className="text-gray-600">
                Navigate your inbox efficiently with our intuitive keyboard
                shorcuts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
