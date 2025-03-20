// app/protected/layout.tsx
import { Navbar } from "./_components/navbar";

interface protectedLayoutProps {
        children: React.ReactNode;
    };

    const protectedLayout = ({ children }: protectedLayoutProps) => {
        return (
            <div className="h-screen w-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
                <Navbar/>
                {children}
            </div>
        );
    };

    export default protectedLayout;