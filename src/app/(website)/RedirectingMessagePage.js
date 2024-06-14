"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectingMessage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/account");
    }, 1000); // 2 seconds delay

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [router]);

  return (
    <section className="pt-32">
      <div className="mb-8">
        <h1 className="text-6xl font-bold">
          You would be redirected to your account dashboard shortly
        </h1>
      </div>
    </section>
  );
}
