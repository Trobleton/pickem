import { UserButton } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { Card } from "../ui/card";

export default function Navigation() {
    return (
        <header className="p-4 w-full">
            <div className="ml-auto w-fit text-white">
                <UserButton showName appearance={{ theme: dark }} />
            </div>
        </header>
    )
}