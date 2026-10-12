import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Award, 
  Users, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Product } from '../../types/store';

interface StorefrontHomepageProps {
  onAddToCart: (product: Product, selectedWeight?: string) => void;
  onOpenCart: () => void;
}

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'MGM Cattle Feed (High Protein Super Mix)',
    category: 'Animal Feed',
    image: '/images/mgm-cattle-feed.png',
    price: 750,
    originalPrice: 950,
    discountBadge: '20% OFF',
    rating: 4.9,
    reviewsCount: 142,
    weightOptions: ['50kg Bag', '25kg Bag', '100kg Bulk'],
    selectedWeight: '50kg Bag',
    inStock: true,
    description: 'Specially formulated cattle feed for higher milk yield and improved livestock digestion.',
  },
  {
    id: 'prod-2',
    name: 'MGM Beauveria Bio-Insecticide (बीव्हेरिया)',
    category: 'Bio-Pesticides',
    image: '/images/mgm-beauveria.png',
    price: 280,
    originalPrice: 350,
    discountBadge: '20% OFF',
    rating: 4.8,
    reviewsCount: 98,
    weightOptions: ['1kg Pack', '5kg Bag', '25kg Bag'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Biological insecticide for natural control of agricultural pests and insects.',
  },
  {
    id: 'prod-3',
    name: 'MGM Pseudomonas Bio-Fertilizer (सुडोमोनास)',
    category: 'Bio-Fertilizers',
    image: '/images/mgm-pseudomonas.png',
    price: 260,
    originalPrice: 320,
    discountBadge: '18% OFF',
    rating: 5.0,
    reviewsCount: 64,
    weightOptions: ['1kg Pack', '5kg Pack'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Phosphate solubilizing bio-fertilizer promoting root growth and crop yield.',
  },
  {
    id: 'prod-4',
    name: 'MGM Trichoderma Viride Bio-Fungicide (ट्रायकोडर्मा विरीडी)',
    category: 'Plant Protection',
    image: '/images/mgm-trichoderma.png',
    price: 220,
    originalPrice: 280,
    discountBadge: '21% OFF',
    rating: 4.9,
    reviewsCount: 88,
    weightOptions: ['1kg Pack', '5kg Pack'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Effective bio-fungicide protecting roots and soil against fungal diseases.',
  },
  {
    id: 'prod-5',
    name: 'MGM Metarhizium Bio-Insecticide (मेटारायझीयम)',
    category: 'Bio-Pesticides',
    image: '/images/mgm-metarhizium.png',
    price: 250,
    originalPrice: 310,
    discountBadge: '19% OFF',
    rating: 4.8,
    reviewsCount: 76,
    weightOptions: ['1kg Pack', '5kg Pack'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Natural entomopathogenic bio-insecticide for subterranean pest management.',
  },
  {
    id: 'prod-6',
    name: 'MGM Verticillium Bio-Insecticide (व्हर्टिसिलियम)',
    category: 'Bio-Pesticides',
    image: '/images/mgm-verticillium.png',
    price: 270,
    originalPrice: 330,
    discountBadge: '18% OFF',
    rating: 4.7,
    reviewsCount: 54,
    weightOptions: ['1kg Pack', '5kg Pack'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Organic bio-insecticide using Verticillium lecanii fungus for whitefly and aphid control.',
  },
  {
    id: 'prod-7',
    name: 'MGM Paecilomyces Bio-Pesticide (पॅसिलोमायसिस)',
    category: 'Bio-Pesticides',
    image: '/images/mgm-paecilomyces.png',
    price: 260,
    originalPrice: 320,
    discountBadge: '18% OFF',
    rating: 4.8,
    reviewsCount: 61,
    weightOptions: ['1kg Pack', '5kg Pack'],
    selectedWeight: '1kg Pack',
    inStock: true,
    description: 'Effective bio-pesticide for nematode and soil-borne pest management in all crops.',
  },
  {
    id: 'prod-8',
    name: 'MGM Neem Organic Bio-Pesticide (निम जैव कीटकनाशक)',
    category: 'Plant Protection',
    image: '/images/mgm-neem.png',
    price: 320,
    originalPrice: 400,
    discountBadge: '20% OFF',
    rating: 4.9,
    reviewsCount: 112,
    weightOptions: ['500ml Bottle', '1L Bottle', '5L Can'],
    selectedWeight: '1L Bottle',
    inStock: true,
    description: 'Natural neem-based organic pesticide for broad-spectrum insect & pest control without chemical residue.',
  },
];

export const StorefrontHomepage: React.FC<StorefrontHomepageProps> = ({
  onAddToCart,
  onOpenCart,
}) => {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleWeightChange = (productId: string, weight: string) => {
    setSelectedWeights((prev) => ({ ...prev, [productId]: weight }));
  };

  const handleAddClick = (product: Product) => {
    const chosenWeight = selectedWeights[product.id] || product.selectedWeight;
    onAddToCart(product, chosenWeight);
    setAddedToast(`Added "${product.name}" (${chosenWeight}) to your cart!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const faqs = [
    {
      q: 'How to buy products from MSM Krishi Vigyan Kendra?',
      a: 'Select your desired agricultural products or cattle feed above, click "Add to Cart", enter your delivery address in Maharashtra, choose your payment mode, and place your order. Delivery is handled directly via KVK logistics.',
    },
    {
      q: 'Does MSM Cattle Feed improve milk fat percentage?',
      a: 'Yes, MSM Cattle Feed is enriched with balanced bypass proteins, minerals, and vitamins that significantly improve livestock health, digestion, and milk fat composition.',
    },
    {
      q: 'Can I order bulk bags for farm co-operatives or group orders?',
      a: 'Yes! For bulk orders exceeding 500kg, you can select our Agri Express Freight option during checkout or contact the KVK Advisory helpline directly.',
    },
    {
      q: 'Can non-farmers or home gardeners buy products here?',
      a: 'Absolutely. We offer organic vermicompost, bio-fertilizers, and plant nutrients in smaller pack sizes suitable for home gardens, terrace gardens, and nurseries.',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] font-sans">
      
      {/* Toast Notification when item added to cart */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#133e1b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-xs font-bold">{addedToast}</span>
          <button 
            onClick={onOpenCart}
            className="ml-2 bg-[#f37021] text-white text-[11px] font-extrabold px-3 py-1 rounded-lg hover:bg-[#eb6619] cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* 🌾 HERO SLIDER BANNER SECTION */}
      <section className="relative bg-gradient-to-r from-[#133e1b] via-[#1b4332] to-[#258d36] text-white overflow-hidden py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="md:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mahatma Gandhi Mission • KVK Gandheli</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              Farmers Served: <br />
              <span className="text-amber-300">10,000+ Livestock Farmers</span> <br />
              Trusted Across Maharashtra
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Discover scientifically formulated cattle feeds, organic fertilizers, bio-pesticides, and farm tools developed at Mahatma Gandhi Mission Krishi Vigyan Kendra.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#products-section"
                className="bg-[#f37021] hover:bg-[#eb6619] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Shop Our Products</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  ★
                </div>
                <div className="text-left text-xs">
                  <strong className="block text-white">4.9 / 5.0 Rating</strong>
                  <span className="text-emerald-200 text-[10px]">Over 2,500 Farmer Reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Product Display */}
          <div className="md:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=600&auto=format&fit=crop&q=80"
                alt="MSM Cattle Feed"
                className="w-full h-64 object-cover rounded-2xl shadow-md"
              />
              <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-[#1e7e34] flex items-center justify-center font-bold">
                  🌱
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#133e1b]">MSM Cattle Feed Super Mix</h4>
                  <p className="text-[10px] text-gray-500">50kg Heavy Duty Moisture-Proof Bag</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🛡 SERVICE HIGHLIGHTS BAR */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#f0f7f1] p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1e7e34] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#133e1b]">Genuine Products</h3>
              <p className="text-xs text-gray-600 mt-0.5">100% Certified Direct from KVK Farm Research Unit</p>
            </div>
          </div>

          <div className="bg-[#f0f7f1] p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1e7e34] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#133e1b]">Farmer Focused</h3>
              <p className="text-xs text-gray-600 mt-0.5">Tailored pricing & guidance for agricultural community</p>
            </div>
          </div>

          <div className="bg-[#f0f7f1] p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1e7e34] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#133e1b]">Training Programs</h3>
              <p className="text-xs text-gray-600 mt-0.5">Free farmer training on animal health & bio-fertilizer use</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🚜 ABOUT KVK SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80"
              alt="Farm tractor"
              className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-[#1e7e34] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              🌱 About Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133e1b]">
              MSM Krishi Vigyan Kendra
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Mahatma Gandhi Mission Krishi Vigyan Kendra is an ICAR-funded agricultural research and extension institution in Chhatrapati Sambhajinagar. We bridge agricultural research with practical farming needs.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <CheckCircle className="w-4 h-4 text-[#f37021]" />
                <span>Practical Training</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <CheckCircle className="w-4 h-4 text-[#f37021]" />
                <span>Technology Transfer</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <CheckCircle className="w-4 h-4 text-[#f37021]" />
                <span>Farmer Support</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <CheckCircle className="w-4 h-4 text-[#f37021]" />
                <span>Modern Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 OUR PRODUCTS SECTION (PRIMARY FOCAL POINT) */}
      <section id="products-section" className="py-12 sm:py-16 px-4 sm:px-8 bg-gradient-to-b from-[#f0f7f1] to-white">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#f37021] uppercase tracking-widest block mb-1">
                🌱 For Online Purchase
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#133e1b]">
                Our Products
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                High-quality cattle feed, bio-fertilizers, organic compost & crop protection items.
              </p>
            </div>

            <button 
              onClick={onOpenCart}
              className="text-xs font-bold text-[#1e7e34] hover:text-[#133e1b] flex items-center gap-1 underline underline-offset-4 cursor-pointer"
            >
              <span>View All Products in Store →</span>
            </button>
          </div>

          {/* Products Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const currentWeight = selectedWeights[product.id] || product.selectedWeight;
              const isWishlisted = wishlist[product.id];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Card Image Container */}
                  <div className="relative bg-gray-50 p-4 h-48 flex items-center justify-center overflow-hidden">
                    {/* Discount Badge */}
                    {product.discountBadge && (
                      <span className="absolute top-3 left-3 bg-[#f37021] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
                        {product.discountBadge}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm transition-transform hover:scale-110 z-10 cursor-pointer ${
                        isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                    </button>

                    {/* Product Image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Weight Variant Selector Pill */}
                      <div className="mb-2">
                        <select
                          value={currentWeight}
                          onChange={(e) => handleWeightChange(product.id, e.target.value)}
                          className="w-full text-[11px] font-bold text-[#1e7e34] bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1e7e34] cursor-pointer"
                        >
                          {product.weightOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              Variant: {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 h-9">
                        {product.name}
                      </h3>

                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 stroke-none" />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {product.rating} ({product.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-[#133e1b]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Action Button */}
                    <button
                      onClick={() => handleAddClick(product)}
                      className="w-full bg-[#1e7e34] hover:bg-[#1b6d2d] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 📰 AGRICULTURE BLOG & UPDATES */}
      <section id="agri-blogs" className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#1e7e34] uppercase tracking-wider">
              From Our Experts
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133e1b]">
              Agriculture Blog & Advisory Updates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Green Feeding Solutions for Dairy Cattle',
                desc: 'Maximize milk yield with balanced protein feed ration during summer months.',
                img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Pest Control Tips for Organic Farming',
                desc: 'Using solar insect light traps to control bollworms in cotton crops naturally.',
                img: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Soil Nutrient Restoration',
                desc: 'Role of bio-fertilizers and Azotobacter in enriching soil microbial life.',
                img: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&auto=format&fit=crop&q=80',
              },
              {
                title: 'Fruit Orchard Care in Monsoon',
                desc: 'Foliar spray techniques for micronutrient absorption in pomegranate & citrus.',
                img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&auto=format&fit=crop&q=80',
              },
            ].map((blog, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <img src={blog.img} alt={blog.title} className="w-full h-36 object-cover" />
                <div className="p-4 space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 leading-snug">{blog.title}</h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">{blog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQS ACCORDION SECTION */}
      <section id="faqs-section" className="py-12 sm:py-16 px-4 sm:px-8 bg-[#f0f7f1]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#1e7e34] uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133e1b]">
              Have Any Questions?
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-gray-900 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#1e7e34] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-gray-600 border-t border-gray-100 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 💬 TESTIMONIALS SECTION */}
      <section className="py-12 sm:py-16 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#f37021] uppercase tracking-wider">Client Reviews</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133e1b]">
              What Our Farmers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ganesh Deshmukh',
                location: 'Paithan, Chhatrapati Sambhajinagar',
                quote: 'Using MSM Cattle Feed for 6 months now. Milk production increased by 1.5 liters per cow daily.',
              },
              {
                name: 'Suresh Patil',
                location: 'Gangapur, Maharashtra',
                quote: 'The bio-fertilizer and solar insect traps saved 40% of my crop protection cost this season.',
              },
              {
                name: 'Vijay Wagh',
                location: 'Aurangabad Rural',
                quote: 'Ordered cattle feed online directly from KVK store. Received delivery at my village doorstep within 2 days.',
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#f0f7f1] p-6 rounded-2xl border border-emerald-100 space-y-4">
                <p className="text-xs text-gray-700 italic leading-relaxed">"{t.quote}"</p>
                <div className="border-t border-emerald-200 pt-3">
                  <h4 className="text-xs font-bold text-[#133e1b]">{t.name}</h4>
                  <p className="text-[10px] text-emerald-800 font-medium">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📌 FOOTER */}
      <footer id="contact-footer" className="bg-[#133e1b] text-white pt-12 pb-6 px-4 sm:px-8 border-t border-emerald-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-xs">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold">
                🌱
              </div>
              <h4 className="font-extrabold text-sm text-white">MGM Krishi Vigyan Kendra</h4>
            </div>
            <p className="text-emerald-200 leading-relaxed text-[11px]">
              Dedicated to agricultural excellence, livestock welfare, and farmer empowerment across Maharashtra.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-emerald-200 text-[11px]">
              <li><a href="#products-section" className="hover:text-white">Our Products Store</a></li>
              <li><a href="#agri-blogs" className="hover:text-white">Agri Advisory Blog</a></li>
              <li><a href="#faqs-section" className="hover:text-white">Frequently Asked Questions</a></li>
              <li><a href="#facility-section" className="hover:text-white">KVK Research Facilities</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-2 text-emerald-200 text-[11px]">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Contact Info</h4>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#f37021]" />
              <span>Gandheli, Paithan Road, Chhatrapati Sambhajinagar, MH - 431007</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#f37021]" />
              <span>+91 240 2400100 / 1800 123 4567</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#f37021]" />
              <span>info@msmkvk.org.in</span>
            </p>
          </div>

          {/* Col 4: Location Map */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">Location Map</h4>
            <div className="w-full h-28 bg-emerald-950 rounded-xl overflow-hidden border border-emerald-800 flex items-center justify-center p-2 text-center text-emerald-300 text-[10px]">
              <span>📍 MGM KVK Campus, Gandheli, Aurangabad Road</span>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-4 border-t border-emerald-900 flex flex-wrap items-center justify-between text-[11px] text-emerald-300">
          <p>© 2026 Mahatma Gandhi Mission Krishi Vigyan Kendra. All rights reserved.</p>
          <p>ICAR Approved Research Center</p>
        </div>
      </footer>

    </div>
  );
};
