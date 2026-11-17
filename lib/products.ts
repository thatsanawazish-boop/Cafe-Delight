export type Category = "burgers" | "pizza" | "sandwiches" | "pasta" | "starters" | "beverages" | "desserts" | "coffee";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number; // ₹, before any offer
  description: string;
  veg: boolean;
  available: boolean;
  bestseller?: boolean;
  offer?: number; // percent off
  image?: string; // for example "/images/cold-coffee.jpg" (put the file in /public/images)
};

export const categories: { id: Category; label: string; emoji: string }[] = [
  { id: "burgers", label: "Burgers", emoji: "🍔" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "sandwiches", label: "Sandwiches", emoji: "🥪" },
  { id: "pasta", label: "Pasta", emoji: "🍝" },
  { id: "starters", label: "Starters", emoji: "🍟" },
  { id: "beverages", label: "Beverages", emoji: "🥤" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
];

// Sample menu. [name, category, price in ₹, vegetarian?, description, optional extras]
// Check every veg/non-veg label and price before the cafe goes live.
type Row = [string, Category, number, boolean, string, Partial<Product>?];
const rows: Row[] = [
  ["Classic Veg Burger", "burgers", 99, true, "Crisp veg patty, lettuce, tomato and creamy mayo in a toasted bun."],
  ["Cheese Burger", "burgers", 129, true, "Veg patty under a melted cheese slice with fresh lettuce and onion.", { bestseller: true }],
  ["Crispy Paneer Burger", "burgers", 149, true, "Golden fried paneer with mint mayo and crunchy lettuce."],
  ["Double Patty Burger", "burgers", 189, true, "Two veg patties, double cheese and house sauce, stacked high."],
  ["Spicy Mexican Burger", "burgers", 159, true, "Bean and corn patty with jalapeños, salsa and a smoky kick."],
  ["Chicken Burger", "burgers", 169, false, "Crunchy chicken fillet with lettuce and garlic mayo in a soft bun."],

  ["Margherita Pizza", "pizza", 189, true, "Tomato sauce, mozzarella and basil on a hand-stretched base."],
  ["Farmhouse Pizza", "pizza", 249, true, "Onion, capsicum, tomato, mushroom and sweet corn under melted cheese."],
  ["Double Cheese Pizza", "pizza", 229, true, "Twice the mozzarella on a thin, crisp crust.", { offer: 10 }],
  ["Paneer Tikka Pizza", "pizza", 259, true, "Tandoori paneer, onion and capsicum with a spiced tikka sauce.", { bestseller: true }],
  ["BBQ Chicken Pizza", "pizza", 299, false, "Smoky barbecue chicken, onion and cheese."],
  ["Peri Peri Pizza", "pizza", 249, true, "Peri peri sauce, capsicum and olives with a fiery finish."],

  ["Grilled Cheese Sandwich", "sandwiches", 119, true, "Golden grilled bread filled with oozing melted cheese."],
  ["Club Sandwich", "sandwiches", 159, true, "Triple-decker toast layered with veggies, cheese and mayo."],
  ["Paneer Sandwich", "sandwiches", 139, true, "Spiced paneer, onion and capsicum grilled in toasted bread."],
  ["Veggie Delight Sandwich", "sandwiches", 109, true, "Cucumber, tomato, onion and green chutney between fresh bread."],

  ["White Sauce Pasta", "pasta", 179, true, "Penne in a creamy white sauce with garlic, herbs and vegetables."],
  ["Red Sauce Pasta", "pasta", 169, true, "Penne tossed in tangy tomato sauce with herbs and veggies."],
  ["Pink Sauce Pasta", "pasta", 189, true, "Creamy and tangy in one bowl, with colourful veggies."],
  ["Alfredo Pasta", "pasta", 199, true, "Rich, creamy garlic sauce with mushrooms and herbs."],

  ["French Fries", "starters", 99, true, "Crisp golden fries with a pinch of salt."],
  ["Peri Peri Fries", "starters", 119, true, "Hot, crunchy fries tossed in peri peri seasoning.", { bestseller: true }],
  ["Cheese Balls", "starters", 149, true, "Crumb-coated bites with a gooey cheese centre."],
  ["Garlic Bread", "starters", 129, true, "Toasted bread with garlic butter and herbs.", { offer: 10 }],
  ["Loaded Nachos", "starters", 169, true, "Corn chips with cheese sauce, salsa, jalapeños and beans.", { bestseller: true }],
  ["Veg Nuggets", "starters", 139, true, "Crispy-coated vegetable nuggets with a tangy dip."],

  ["Cold Coffee", "beverages", 119, true, "Chilled, creamy coffee blended with ice.", { bestseller: true }],
  ["Chocolate Shake", "beverages", 139, true, "Thick chocolate milkshake finished with a chocolate drizzle."],
  ["Oreo Shake", "beverages", 149, true, "Cookies-and-cream shake blended with Oreo crumbs.", { offer: 15 }],
  ["Strawberry Shake", "beverages", 139, true, "Thick, creamy strawberry milkshake."],
  ["Fresh Lime Soda", "beverages", 79, true, "Fresh lime and soda, served sweet, salted or mixed."],
  ["Mojito", "beverages", 99, true, "Mint, lime and soda over crushed ice."],

  ["Chocolate Brownie", "desserts", 109, true, "Fudgy chocolate brownie, served warm."],
  ["Chocolate Lava Cake", "desserts", 129, true, "Warm cake with a molten chocolate centre.", { bestseller: true }],
  ["Cheesecake", "desserts", 179, true, "Creamy baked cheesecake on a biscuit base.", { available: false }],
  ["Ice Cream Sundae", "desserts", 149, true, "Ice cream scoops with chocolate sauce, nuts and a cherry."],
  ["Waffles", "desserts", 139, true, "Crisp waffles with chocolate sauce and toppings.", { offer: 10 }],
  ["Pancakes", "desserts", 129, true, "Fluffy pancakes stacked with syrup."],

  ["Espresso", "coffee", 89, true, "A short, strong shot of freshly pulled espresso."],
  ["Cappuccino", "coffee", 119, true, "Espresso with steamed milk and a deep layer of foam.", { bestseller: true }],
  ["Cafe Latte", "coffee", 129, true, "Smooth espresso with plenty of silky steamed milk."],
  ["Americano", "coffee", 99, true, "Espresso lengthened with hot water for a clean, bold cup."],
  ["Mocha", "coffee", 149, true, "Espresso, chocolate and steamed milk, topped with cream."],
  ["Caramel Macchiato", "coffee", 159, true, "Vanilla milk, espresso and a caramel drizzle on top."],
];

export const products: Product[] = rows.map(([name, category, price, veg, description, extra]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  category,
  price,
  veg,
  description,
  available: true,
  ...extra,
}));

export const finalPrice = (p: Product) => (p.offer ? Math.round((p.price * (100 - p.offer)) / 100) : p.price);
export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Every page reads the menu through this function, so it can later be pointed at a database.
export async function getProducts(): Promise<Product[]> {
  return products;
}
