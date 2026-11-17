import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import CheckoutView from "./CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  return <CheckoutView products={await getProducts()} />;
}
