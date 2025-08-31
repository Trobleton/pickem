"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import Image from "next/image";
import { isUserAdmin } from "@/lib/user";
import { Button } from "../ui/button";

export default function Navigation() {
  const user = useUser();
  const isAdmin = isUserAdmin(user);

  return (
    <header className="p-4 w-full flex flex-row items-center gap-4">
      <nav>
        <Link
          href="/"
          className="flex flex-row gap-2 items-center text-2xl font-bold text-white"
        >
          <Image
            src="/images/roflgator-logo.gif"
            height={48}
            width={48}
            alt="Roflgator"
          />
          Pick&apos;Em
        </Link>
      </nav>
      <div className="ml-auto flex flex-row items-center gap-2 w-fit text-white">
        {isAdmin ? (
          <Button variant="link" size="sm">
            <Link href="/admin">Admin</Link>
          </Button>
        ) : null}
        <UserButton showName appearance={{ theme: dark }} />
      </div>
    </header>
  );
}
