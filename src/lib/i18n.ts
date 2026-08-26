import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Shaza Creation",
      shop_now: "Shop Now",
      cart: "Cart",
      featured_products: "Featured Products",
      price: "Price",
      add_to_cart: "Add to Cart",
      artisanal_craftsmanship: "Artisanal Craftsmanship",
      hero_title: "\"Because every great outfit deserves a masterpiece.\"",
      hero_subtitle: "A woman's bag is more than just an accessory—it's her most trusted companion. Discover handcrafted, elegant designs that turn heads and elevate your everyday aura.",
      winning_products: "The Collection",
      curated_masterpieces: "Curated masterpieces",
      no_products: "No products uploaded yet.",
      curated_collection: "Curated Collection",
      shop_subtitle: "Discover the perfect companion. Handcrafted with love, designed for the modern woman.",
      search_placeholder: "Search for bags...",
      sort_popular: "Popularity",
      sort_price_low: "Price: Low to High",
      sort_price_high: "Price: High to Low",
      no_bags_found: "No bags found in this category.",
      clear_search: "Clear search",
      your_cart: "Your Shopping Cart",
      total: "Total",
      checkout_button: "Checkout",
      empty_cart: "Your cart is empty",
      continue_shopping: "Continue Shopping"
    }
  },
  hi: {
    translation: {
      welcome: "शाजा क्रिएशन में आपका स्वागत है",
      shop_now: "अभी खरीदें",
      cart: "कार्ट",
      featured_products: "विशेष उत्पाद",
      price: "कीमत",
      add_to_cart: "कार्ट में डालें",
      artisanal_craftsmanship: "कलात्मक कारीगरी",
      hero_title: "क्योंकि हर बेहतरीन पहनावे को एक उत्कृष्ट कृति की आवश्यकता होती है।",
      hero_subtitle: "एक महिला का बैग सिर्फ एक एक्सेसरी नहीं है—यह उसका सबसे भरोसेमंद साथी है। हस्तनिर्मित, सुंदर डिज़ाइनों की खोज करें जो हर किसी का ध्यान आकर्षित करें।",
      winning_products: "संग्रह",
      curated_masterpieces: "चुनिंदा उत्कृष्ट कृतियाँ",
      no_products: "अभी तक कोई उत्पाद अपलोड नहीं किया गया है।",
      curated_collection: "चुनिंदा संग्रह",
      shop_subtitle: "अपने लिए सही साथी खोजें। आधुनिक महिलाओं के लिए प्यार से तैयार किया गया।",
      search_placeholder: "बैग खोजें...",
      sort_popular: "लोकप्रियता",
      sort_price_low: "कीमत: कम से ज्यादा",
      sort_price_high: "कीमत: ज्यादा से कम",
      no_bags_found: "इस श्रेणी में कोई बैग नहीं मिला।",
      clear_search: "खोज साफ़ करें",
      your_cart: "आपका शॉपिंग कार्ट",
      total: "कुल",
      checkout_button: "चेकआउट",
      empty_cart: "आपका कार्ट खाली है",
      continue_shopping: "खरीदारी जारी रखें"
    }
  },
  gu: {
    translation: {
      welcome: "શાજા ક્રિએશનમાં તમારું સ્વાગત છે",
      shop_now: "હમણાં જ ખરીદી કરો",
      cart: "કાર્ટ",
      featured_products: "વિશેષ ઉત્પાદનો",
      price: "કિંમત",
      add_to_cart: "કાર્ટમાં ઉમેરો",
      artisanal_craftsmanship: "કલાત્મક કારીગરી",
      hero_title: "કારણ કે દરેક શ્રેષ્ઠ પોશાકને એક ઉત્કૃષ્ટ કૃતિની જરૂર હોય છે.",
      hero_subtitle: "સ્ત્રીની બેગ માત્ર એક સહાયક નથી-તેની સૌથી વિશ્વાસુ સાથી છે. હાથથી બનાવેલી સુંદર ડિઝાઇન શોધો જે દરેકનું ધ્યાન આકર્ષિત કરે.",
      winning_products: "સંગ્રહ",
      curated_masterpieces: "પસંદ કરેલ ઉત્કૃષ્ટ કૃતિઓ",
      no_products: "હજુ સુધી કોઈ ઉત્પાદનો અપલોડ કર્યા નથી.",
      curated_collection: "પસંદ કરેલ સંગ્રહ",
      shop_subtitle: "તમારા માટે યોગ્ય સાથી શોધો. આધુનિક મહિલાઓ માટે પ્રેમથી બનાવેલ.",
      search_placeholder: "બેગ શોધો...",
      sort_popular: "લોકપ્રિયતા",
      sort_price_low: "કિંમત: ઓછી થી વધુ",
      sort_price_high: "કિંમત: વધુ થી ઓછી",
      no_bags_found: "આ શ્રેણીમાં કોઈ બેગ મળી નથી.",
      clear_search: "શોધ સાફ કરો",
      your_cart: "તમારું શોપિંગ કાર્ટ",
      total: "કુલ",
      checkout_button: "ચેકઆઉટ",
      empty_cart: "તમારું કાર્ટ ખાલી છે",
      continue_shopping: "ખરીદી ચાલુ રાખો"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
