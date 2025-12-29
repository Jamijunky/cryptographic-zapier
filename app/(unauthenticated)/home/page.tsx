"use client";
import Landing from "@/components/landing/Landing";
import Header from "@/components/landing/Header";
import Description from "@/components/landing/Description";
import Features from "@/components/landing/Features";
import PixelShowcase from "@/components/landing/PixelShowcase";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-black overflow-x-hidden">
      <Header />
      <Landing />
      <Description />
      <Features />
      <PixelShowcase />
      <Footer />
    </main>
  );
}


