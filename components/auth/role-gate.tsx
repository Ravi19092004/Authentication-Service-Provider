// components/auth/role-gate.tsx
"use client";

import { useCurrentRole } from "@/hooks/use-current-role";
import { UserRole } from "@prisma/client";
import { FormError } from "../form-error";

interface RoleGateProps {
    children: React.ReactNode;
    allowedRole: UserRole; // ✅ Fixed prop name
}

export const RoleGate = ({ children, allowedRole }: RoleGateProps) => {
    const role = useCurrentRole(); // ✅ Fixed function name

    if (role !== allowedRole) {
        return (
            <FormError message="You do not have permission to view this content!" />
        );
    }

    return <>{children}</>;
};
