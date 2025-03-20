// import { Poppins } from "next/font/google";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { LoginButton } from "../components/auth/login-button";

// Initialize the font
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["600"],
//   display: "swap",
// });

export default function Authlogin() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        {/* Use poppins.className instead of font.className */}
        {/* poppins.className this code has been commented from h1 */}
        <h1 className={cn("text-6xl font-semibold text-white drop-shadow-md")}>
          🔐 Auth
        </h1>
        <p className="text-lg text-white">A simple authentication Service</p>
        <div>
          <LoginButton>
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}