export type Category = "burgers" | "combos" | "shawarma" | "pizza" | "sandwiches" | "footlong" | "fries" | "bites" | "shakes" | "coolers" | "coffee";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number; // ₹, before any offer
  description?: string;
  veg: boolean;
  available: boolean;
  featured?: boolean; // shown in "From our menu" on the home page
  offer?: number; // percent off
  image?: string; // for example "/images/veg-burger.jpg" (put the file in /public/images)
};

export const categories: { id: Category; label: string; emoji: string }[] = [
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "combos", label: "Combo Meals", emoji: "🍱" },
  { id: "shawarma", label: "Shawarma", emoji: "🌯" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "sandwiches", label: "Grill Sandwiches", emoji: "🥪" },
  { id: "footlong", label: "Footlong", emoji: "🥖" },
  { id: "fries", label: "French Fries", emoji: "🍟" },
  { id: "bites", label: "Quick Bites", emoji: "🍗" },
  { id: "shakes", label: "Milk Shakes", emoji: "🥤" },
  { id: "coolers", label: "Coolers and Mojito", emoji: "🍹" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
];

// Menu typed in from photos of the cafe's menu card. The photos were small and blurry:
// CHECK EVERY PRICE against the printed menu before launch. Lines marked VERIFY were the hardest to read.
// Format: [name, price in ₹, optional description]. Dishes with "Chicken" or "Omlet" in the name are marked non-veg.
const menu: Record<Category, [name: string, price: number, description?: string][]> = {
  burgers: [
    ["Veg Burger", 80],
    ["Veg Cheese Burger", 90],
    ["Veg Double Deck Burger", 125],
    ["Veg Paneer Burger", 110],
    ["Cheesy Paneer Burger", 120],
    ["Veg Spicy Burger", 95],
    ["Chicken Burger", 85],
    ["Chicken Cheese Burger", 95],
    ["Chicken Double Deck Burger", 130],
    ["Chicken Spicy Burger", 100],
  ],
  combos: [
    ["Chicken Burger + Fries + Pepsi", 170],
    ["Veg Burger + Fries + Pepsi", 165],
    ["Chicken Shawarma + Fries + Pepsi", 170],
    ["Veg Shawarma + Fries + Pepsi", 165],
    ["Chicken Footlong + Fries + Pepsi", 170],
    ["Veg Footlong + Fries + Pepsi", 165],
  ],
  shawarma: [
    ["Chicken Shawarma", 85],
    ["Chicken Cheesy Shawarma", 100],
    ["Chicken Spicy Shawarma", 95],
    ["Veg Shawarma", 80], // VERIFY
  ],
  // VERIFY: all pizza prices were hard to read.
  pizza: [
    ["Cheese Pizza", 215, "Only cheese."],
    ["Corn Cheese Pizza", 250, "Corn and cheese."],
    ["Veg Pizza", 240],
    ["Veg Supreme Pizza", 240],
    ["Veg Delight Pizza", 260],
    ["Veg Paprika Pizza", 240],
    ["Veg Paneer Pizza", 250],
    ["Veg Paneer Delight Pizza", 280],
    ['Veg Family Feast Pizza (10")', 330],
    ['Veg Paneer Family Feast Pizza (10")', 345],
    ["Chicken Pizza", 280],
    ["Chicken Supreme Pizza", 295],
    ["Chicken Delight Pizza", 315],
    ["Chicken Paprika Pizza", 295],
    ['Chicken Family Feast Pizza (10")', 395],
  ],
  // VERIFY: sandwich prices were hard to read.
  sandwiches: [
    ["Veg Grill Sandwich", 85],
    ["Veg Cheese Grill Sandwich", 100],
    ["Cheese Grill Sandwich", 80],
    ["Veg Mayo Grill Sandwich", 90],
    ["Paneer Sandwich", 110],
    ["Cheesy Paneer Sandwich", 120],
    ["Veg Club Sandwich", 125],
    ["Veg Club Cheese Sandwich", 140],
    ["Omlet Cheese Grill Sandwich", 95],
    ["Chicken Grill Sandwich", 95],
    ["Chicken Cheese Grill Sandwich", 105],
    ["Chicken Club Grill Sandwich", 135],
    ["Chicken Cheese Club Grill Sandwich", 150],
  ],
  footlong: [
    ["Veg Footlong", 90, '6" sandwich.'],
    ["Veg Schezwan Footlong", 95, '6" sandwich.'],
    ["Chicken Footlong", 100, '6" sandwich.'],
    ["Chicken Schezwan Footlong", 105, '6" sandwich.'],
  ],
  // VERIFY: Pizza Fries price.
  fries: [
    ["Pizza Fries", 200],
    ["French Fries (Regular)", 80],
    ["French Fries (Large)", 105],
    ["Peri Peri Fries (Regular)", 90],
    ["Peri Peri Fries (Large)", 130],
  ],
  // VERIFY: quick bites prices.
  bites: [
    ["Chicken Nuggets", 120],
    ["Aloo Tikki Bites", 80],
    ["Potato Pops", 80],
    ["Potato Pops with Cheese", 100],
  ],
  shakes: [
    ["Apple Butterscotch Shake", 65],
    ["Chocolate Shake", 65],
    ["Strawberry Shake", 65],
    ["Kiwi Shake", 65],
    ["Cold Coffee", 65],
    ["Cold Coffee with Ice Cream", 90],
    ["Strawberry Shake with Ice Cream", 90],
    ["Chocolate Shake with Ice Cream", 90],
  ],
  coolers: [
    ["Blue Lime", 60],
    ["Green Apple", 60],
    ["Lemon Blue Mojito", 90],
    ["Green Mint Mojito", 90],
  ],
  coffee: [
    ["Cappuccino", 85],
    ["Café Latte", 85],
    ["Mocha", 85],
    ["Nescafe", 35],
    ["Black Coffee", 25],
  ],
};

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Dishes shown in "From our menu" on the home page. Change the ids to feature other dishes.
const featured = new Set(["veg-cheese-burger", "chicken-cheesy-shawarma", "peri-peri-fries-regular", "cold-coffee-with-ice-cream"]);

export const products: Product[] = categories.flatMap((c) =>
  menu[c.id].map(([name, price, description]) => ({
    id: slug(name),
    name,
    category: c.id,
    price,
    description,
    veg: !/chicken|omlet/i.test(name),
    available: true,
    featured: featured.has(slug(name)),
  })),
);

export const finalPrice = (p: Product) => (p.offer ? Math.round((p.price * (100 - p.offer)) / 100) : p.price);
export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Every page reads the menu through this function, so it can later be pointed at a database.
export async function getProducts(): Promise<Product[]> {
  return products;
}
