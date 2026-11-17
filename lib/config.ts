// Central site settings. Edit this file to set up the cafe; no other file needs changing.
export const cafe = {
  name: "Cafe Delight",
  tagline: "Taste the Happiness, One Bite at a Time.",
  // WhatsApp number that receives orders: country code + number, digits only (for example "919876543210").
  // PLACEHOLDER: online ordering stays switched off until this is replaced with the cafe's real number.
  whatsappNumber: "918707764452",
  phone: "+9187077 64452", // placeholder
  email: "thatsanawazish@gmail.com", // placeholder
  address: "3CJG+QGQ, Kakartale, Mahad, Maharashtra 402301", // placeholder
  // Sample opening hours: replace with the cafe's real hours.
  hours: [
    ["Monday to Friday", "10:00 AM – 11:00 PM"],
    ["Saturday and Sunday", "9:00 AM – 12:00 AM"],
  ] as [string, string][],
  deliveryFee: 0, // ₹ added to delivery orders (0 = free delivery)
  heroImage: "", // optional home-page photo, for example "/images/hero.jpg" (put the file in /public/images)
  mapEmbedUrl: "", // paste the src of Google Maps > Share > Embed a map
  // Generic links to the platforms: replace with the cafe's own profile URLs.
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],
};

// SAMPLE reviews so the page is not empty. Replace them with real customer reviews before launch.
export const reviews = [
  { name: "Sample reviewer", stars: 5, text: "Sample review: hot food, friendly service and a menu with something for everyone." },
  { name: "Sample reviewer", stars: 5, text: "Sample review: the coffee and desserts are the reason we keep coming back." },
  { name: "Sample reviewer", stars: 4, text: "Sample review: easy to order on WhatsApp and the pizza arrived just as we hoped." },
];
