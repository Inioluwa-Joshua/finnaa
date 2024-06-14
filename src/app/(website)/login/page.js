import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LoginWithGoogle from "@/components/buttons/LoginWithGoogle";
import { getServerSession } from "next-auth";
import RedirectingMessage from "../RedirectingMessagePage";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      {session ? (
        <RedirectingMessage />
      ) : (
        <div>
          <div className="p-4 max-w-xs mx-auto">
            <h1 className="text-[2rem] md:text-4xl font-bold text-center mb-2">
              Sign In
            </h1>
            <p className="text-center mb-6 text-gray-500">
              Sign in to your account using one of the methods below
            </p>
            <LoginWithGoogle />
          </div>
        </div>
      )}
    </div>
  );
}
