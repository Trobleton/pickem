import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Card } from "../ui/card";
import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
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
      <div className="ml-auto w-fit text-white">
        <UserButton showName appearance={{ theme: dark }} />
      </div>
    </header>
  );
}

