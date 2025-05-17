import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/header";
import Footer from "./components/footer";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "C-Mart - University E-commerce",
  description: "Buy and sell products within your university community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
            <Analytics />
          </main>
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
