/**
 * Seed initial categories (Udemy-style).
 * Run from back-end folder: node scripts/seedCategories.js
 */
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../src/config/db");
const Category = require("../src/models/Category");

const INITIAL_CATEGORIES = [
  { name: "Development", description: "Programming, web development, and software" },
  { name: "Business", description: "Management, marketing, and entrepreneurship" },
  { name: "Finance & Accounting", description: "Finance, accounting, and investing" },
  { name: "Design", description: "Graphic design, UI/UX, and creative tools" }
];

async function seed() {
  await connectDB();

  for (const cat of INITIAL_CATEGORIES) {
    const slug = cat.name
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9-]/g, "");
    await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name: cat.name, slug, description: cat.description || "" } },
      { upsert: true, new: true }
    );
    console.log("Seeded:", cat.name);
  }

  console.log("Done. Categories:", await Category.find().select("name slug").lean());
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
