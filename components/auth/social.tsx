// components/auth/social.tsx
"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"; // Client-side signIn
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const Social = () => {
    const onClick = (provider: "google" | "github") => {
        signIn(provider, { callbackUrl: DEFAULT_LOGIN_REDIRECT });
    };

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-32 flex items-center justify-center py-3 px-4"
                variant="outline"
                onClick={() => onClick("google")}
            >
                <FcGoogle className="h-6 w-6" />
            </Button>
            <Button
                size="lg"
                className="w-32 flex items-center justify-center py-3 px-4"
                variant="outline"
                onClick={() => onClick("github")}
            >
                <FaGithub className="h-6 w-6" />
            </Button>
        </div>
    );
};