import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import CartView from "./CartView";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  return <CartView products={await getProducts()} />;
}
