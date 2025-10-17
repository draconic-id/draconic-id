"use client";

import Link from "next/link";
import { useFooter } from "./footer-context";

export default function Footer() {
  const { visible, attribution } = useFooter();
  if (!visible) return null;

  return (
    <footer className="border-t py-6 text-sm mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>© {new Date().getFullYear()} Draconic ID</div>
          <div className="flex gap-4">
            <Link target="_blank" href="https://status.bluefi.re" className="underline">Status</Link>
            <Link href="/faq" className="underline">FAQ</Link>
            <Link target="_blank" href="https://mailhide.io/e/RPzCeWBk" className="underline">Contact</Link>
          </div>
        </div>
        {attribution && (
          <div className="mt-2 text-xs text-muted-foreground">
            {attribution}
          </div>
        )}
      </div>
    </footer>
  );
}
