import { UserButton } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { Card } from "../ui/card";
import Link from "next/link";

export default function Navigation() {
    return (
        <header className="p-4 w-full flex flex-row items-center gap-4">
            <nav>
                <Link href="/" className="text-2xl font-bold text-white">Pickem</Link>
            </nav>
            <div className="ml-auto w-fit text-white">
                <UserButton showName appearance={{ theme: dark }} />
            </div>
        </header>
    )
}