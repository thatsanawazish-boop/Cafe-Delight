// Central site settings. Edit this file to set up the cafe; no other file needs changing.
export const cafe = {
  name: "Cafe Delight",
  timezone: "Asia/Kolkata", // sales reports split days in this timezone
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
  heroImage: "/images/storefront.jpg", // photo beside the home-page heading (file is in /public/images)
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3792.774896477059!2d73.42636949999999!3d18.081972699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be82ad3b13092d1%3A0xeec16ac24259d4aa!2sCafe%20Delight!5e0!3m2!1sen!2sin!4v1794921548099!5m2!1sen!2sin", // paste the src of Google Maps > Share > Embed a map
  // Generic links to the platforms: replace with the cafe's own profile URLs.
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],
};
