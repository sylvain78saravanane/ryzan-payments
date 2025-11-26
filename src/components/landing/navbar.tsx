import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Image src={"/ryzan.png"} width={200} height={200} alt="Ryzan Logo"/>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/login">
                    <Button variant="default">Se connecter</Button>
                </Link>
            </div>
        </nav>
    );
}