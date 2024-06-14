import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HeroForm from "@/components/forms/HeroForm";
import { getServerSession } from "next-auth";
import RedirectingMessage from "./RedirectingMessagePage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      {session ? (
        <RedirectingMessage />
      ) : (
        <section className="pt-28">
          <div className=" mb-8">
            <h1 className="text-[2rem] md:text-6xl font-bold">
              Your one link
              <br />
              for everything
            </h1>
            <h2 className="text-gray-500 text-[1rem] md:text-xl mt-6">
              Share your links, social profiles, contact info, and more on one
              page
            </h2>
          </div>
          <HeroForm user={session?.user} />
        </section>
      )}
    </main>
  );
}
