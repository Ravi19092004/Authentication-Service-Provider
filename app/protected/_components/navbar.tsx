"use client";
import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const user = useCurrentUser();

    return (
        <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm">
            <div className="flex gap-x-2">
                <Button
                    variant={pathname === "/protected/server" ? "default" : "outline"}
                    onClick={() => router.push("/protected/server")}
                >
                    Server
                </Button>
                <Button
                    variant={pathname === "/protected/client" ? "default" : "outline"}
                    onClick={() => router.push("/protected/client")}
                >
                    Client
                </Button>
                <Button
                    variant={pathname === "/protected/admin" ? "default" : "outline"}
                    onClick={() => router.push("/protected/admin")}
                >
                    Admin
                </Button>
                <Button
                    variant={pathname === "/protected/settings" ? "default" : "outline"}
                    onClick={() => router.push("/protected/settings")}
                >
                    Settings
                </Button>
            </div>
            <div className="flex items-center gap-x-2">
                {user?.isOAuth === true && (
                    <span className="text-sm text-gray-500">Logout</span>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="cursor-pointer">
                                <UserButton />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </nav>
    );
};