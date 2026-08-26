const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\hasan\\.gemini\\antigravity\\brain\\787fda9c-d9a7-4045-a620-a32d13f88c77";
const logoPath = path.join(basePath, "shaza_logo_1785565254245.jpg");

const bags = [
  { name: "Ruby Red Luxury Artisan Bag", file: "bag_ruby_red_1785567421847.jpg", category: "Handbags" },
  { name: "Emerald Green Elegance Bag", file: "bag_emerald_green_1785567432697.jpg", category: "Totes" },
  { name: "Mustard Yellow Classic Tote", file: "bag_mustard_yellow_1785567444077.jpg", category: "Handbags" },
  { name: "Classic Black Evening Bag", file: "bag_classic_black_1785567453695.jpg", category: "Clutches" },
  { name: "Pure White Angelic Handbag", file: "bag_pure_white_1785567464966.jpg", category: "Handbags" },
  { name: "Hot Pink Heart Charm Bag", file: "pink_heart_bag_1_1785567724589.jpg", category: "Crossbody" },
  { name: "Vibrant Fuchsia Artisan Bag", file: "pink_heart_bag_2_1785567735213.jpg", category: "Crossbody" }
];

async function main() {
  const products = [];
  const logo = await Jimp.read(logoPath);
  logo.resize({ w: 150 });

  for (const bag of bags) {
    console.log(`Processing ${bag.name}...`);
    const imgPath = path.join(basePath, bag.file);
    const img = await Jimp.read(imgPath);
    
    // Add watermark in bottom right corner
    const x = img.bitmap.width - logo.bitmap.width - 20;
    const y = img.bitmap.height - logo.bitmap.height - 20;
    
    img.composite(logo, x, y);

    img.resize({ w: 600 });

    const base64 = await img.getBase64("image/jpeg");
    
    products.push({
      title: bag.name,
      price: 800,
      stock: 10,
      category: bag.category,
      rating: 5,
      image: base64,
      description: "A stunning handcrafted chunky yarn bag, featuring premium materials and an elegant weave."
    });
  }

  fs.writeFileSync("watermarked_products.json", JSON.stringify(products, null, 2));
  console.log("Finished generating watermarked_products.json with " + products.length + " products.");
}

main().catch(console.error);
