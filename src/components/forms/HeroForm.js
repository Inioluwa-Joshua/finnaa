"use client";

import { signIn } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HeroForm({ user }) {
  const router = useRouter();
  useEffect(() => {
    if (
      "localStorage" in window &&
      window.localStorage.getItem("desiredUsername")
    ) {
      const username = window.localStorage.getItem("desiredUsername");
      window.localStorage.removeItem("desiredUsername");
      redirect("/account?desiredUsername=" + username);
    }
  }, []);
  async function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    const input = form.querySelector("input");
    const username = input.value;
    if (username.length > 0) {
      if (user) {
        router.push("/account?desiredUsername=" + username);
      } else {
        window.localStorage.setItem("desiredUsername", username);
        await signIn("google");
      }
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
      <div className="inline-flex gap-2 px-4 py-2 items-center shadow-lg bg-white shadow-gray-500/20 rounded-[20px]">
        <span className="bg-white pl-4">finnaa.vercel.app/</span>
        <input
          type="text"
          className="focus:outline-none"
          style={{ backgroundColor: "white", marginBottom: 0, paddingLeft: 0 }}
          placeholder="username"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-4 px-6 whitespace-nowrap rounded-[20px]"
      >
        Join for Free
      </button>
    </form>
  );
}
