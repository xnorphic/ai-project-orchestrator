"use client";

import Link from "next/link";
import { Button, Card } from "@/components/ui/primitives";

export function EmptyState({
  title,
  desc,
  href,
  cta,
}: {
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <Card className="p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-mint-100 text-2xl">
          ⌁
        </div>
        <h2 className="text-xl font-extrabold text-midnight">{title}</h2>
        <p className="mt-2 text-muted font-[family-name:var(--font-ui)]">{desc}</p>
        <Link href={href} className="mt-6 inline-block">
          <Button>{cta}</Button>
        </Link>
      </Card>
    </div>
  );
}
