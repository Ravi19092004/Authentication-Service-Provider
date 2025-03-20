// components/auth/logout-button.tsx
"use client"

import { logout } from "../../src/actions/logout";
interface LogoutButtonProps {
    children: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
    const onClick = () => {
        logout();
    };

    return (
        <span onClick={onClick} className="cursor-pointer">{children}</span>
    )
}