import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather, Merriweather_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import { FooterProvider } from "@/components/footer/footer-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: "300"
});

const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: "300"
});

export const metadata: Metadata = {
  title: "Draconic ID",
  description: "Here be dragons. Here be you?",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <FooterProvider>
          <Navigation />
          <Toaster position="bottom-center" />
          {children}
          <Footer />
        </FooterProvider>
      </body>
    </html >
  );
}
