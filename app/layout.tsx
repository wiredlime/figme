import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./room";
import LayoutProvider from "@/components/layout-provider";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Figme",
  description: "Real-time collaborative design space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workSans.className} `}>
        <Room>
          <LayoutProvider>{children}</LayoutProvider>
        </Room>
      </body>
    </html>
  );
}
