import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/header";

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
          <main className="flex-grow">{children}</main>
          <footer className="bg-gray-100 py-6 mt-8">
            <div className="container mx-auto px-4 text-center text-gray-600">
              &copy; {new Date().getFullYear()} C-Mart. All rights reserved.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
