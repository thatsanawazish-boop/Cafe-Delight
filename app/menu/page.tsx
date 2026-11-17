import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import MenuClient from "./MenuClient";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  return <MenuClient products={await getProducts()} />;
}
