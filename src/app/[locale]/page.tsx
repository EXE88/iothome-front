import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import DeviceTrio from "@/components/DeviceTrio";
import HowItWorks from "@/components/HowItWorks";
import ProductRail from "@/components/ProductRail";
import Trust from "@/components/Trust";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/products";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  // The rail is the catalogue, not a copy of it. If the backend is down the
  // rail renders nothing rather than showing three products that may not
  // exist — the rest of the page is a story about the product and still reads.
  const products = (await fetchProducts()) ?? [];

  return (
    <>
      <Nav dict={dict} locale={locale} />
      <main>
        <Hero dict={dict} locale={locale} />
        <DeviceTrio dict={dict} />
        <HowItWorks dict={dict} />
        <ProductRail products={products} dict={dict} locale={locale} />
        <Trust dict={dict} />
        <Closing dict={dict} locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
