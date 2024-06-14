import Header from "@/components/Header";
import { Lato } from "next/font/google";
import "../globals.css";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata = {
  title: "Finnaa",
  description: "The solution to easy networking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <main>
          <div className="p-4">
            <Header />
          </div>
          <div className="mx-auto md:px-12 px-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
