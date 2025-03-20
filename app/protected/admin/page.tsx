"use client"

import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { Server } from "lucide-react"; // Import an icon for visual enhancement

const AdminPage = () => {
    const onApiRouteClick = () => {
        fetch("/api/admin")
        .then((response) => {
            if (response.ok) {
                console.log("OKAY")
            } else {
                console.error("FORBIDDEN");
            }
        })
    }

    return (
        <Card className="w-[600px]">
            <CardHeader>
                <p className="text-2xl font-semibold text-center">
                    🔑 Admin
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <RoleGate allowedRole={UserRole.ADMIN}>
                    <FormSuccess message="You are allowed to see this content!" />
                </RoleGate>
                <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-x-2">
                        <Server className="h-5 w-5 text-gray-500" /> {/* Add an icon */}
                        <p className="text-sm font-semibold text-gray-700">
                            Admin-Only API Route
                        </p>
                    </div>
                    <Button 
                        onClick={onApiRouteClick} 
                        variant="black" // Use the new black variant
                    >
                        Click to test
                    </Button>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-x-2">
                        <Server className="h-5 w-5 text-gray-500" /> {/* Add an icon */}
                        <p className="text-sm font-semibold text-gray-700">
                            Admin-Only Server Action
                        </p>
                    </div>
                    <Button 
                        onClick={onApiRouteClick} 
                        variant="black" // Use the new black variant
                    >
                        Click to test
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default AdminPage;