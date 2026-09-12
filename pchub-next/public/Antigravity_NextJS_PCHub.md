# ANTIGRAVITY PROMPTS — PCHub Next.js
# Chuyển đổi Digitax Home Page 2 → PCHub với Next.js 14 + Tailwind CSS
# Tham chiếu: https://demo2.wpthemego.com/themes/sw_digitax/home-page-2/
# Tác giả: Lê Văn Chương

---

## CÁCH DÙNG
# Paste từng PROMPT vào Antigravity theo thứ tự A → N
# Antigravity sẽ sinh code Next.js hoàn chỉnh cho từng component
# Ghép lại theo file structure ở PROMPT 0

---

## ══════════════════════════════════════════════════════════════
## PROMPT 0 — PROJECT SETUP & ARCHITECTURE
## Chạy đầu tiên — Antigravity tạo project structure
## ══════════════════════════════════════════════════════════════

```
Create a Next.js 14 project structure for "PCHub" — a Vietnamese PC components
e-commerce website. Reference layout: Digitax Home Page 2 template.

TECH STACK:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v3
- shadcn/ui components
- Lucide React icons
- next/image for all images
- next/font (Inter + JetBrains Mono)
- Framer Motion (animations)
- Zustand (cart/wishlist state)
- React Hook Form + Zod (forms)

DESIGN TOKENS (tailwind.config.ts):
colors:
  navy: { DEFAULT: '#0F1929', light: '#1e2d42' }
  blue: { DEFAULT: '#2563EB', hover: '#1d4ed8' }
  violet: { DEFAULT: '#6366F1', end: '#8B5CF6' }
  success: '#10B981'
  warning: '#F59E0B'
  danger: '#EF4444'
fontFamily:
  sans: ['Inter', 'sans-serif']
  mono: ['JetBrains Mono', 'monospace']

PROJECT FILE STRUCTURE:
/app
  /layout.tsx              ← root layout (fonts, providers)
  /page.tsx                ← homepage (imports all sections)
  /globals.css
  /(shop)
    /[category]/page.tsx
    /[category]/[slug]/page.tsx
  /(account)
    /cart/page.tsx
    /checkout/page.tsx
    /order-success/page.tsx
    /account/layout.tsx
    /account/page.tsx

/components
  /layout
    Header.tsx             ← TopBar + MainHeader + MegaNav
    TopBar.tsx
    MainHeader.tsx
    MegaNav.tsx
    CartDrawer.tsx
    Footer.tsx
  /home
    HeroSlider.tsx
    TrustBadges.tsx
    FlashSaleSection.tsx
    CategoryGrid.tsx
    TabbedProducts.tsx
    PromoBanner.tsx
    MostViewed.tsx
    AIBuilderPreview.tsx
    CommunityBuilds.tsx
    Testimonials.tsx
    BlogSection.tsx
    BrandStrip.tsx
  /product
    ProductCard.tsx        ← shared card used everywhere
    ProductGrid.tsx
    QuickView.tsx
  /ui
    CountdownTimer.tsx
    PriceDisplay.tsx       ← always JetBrains Mono
    StarRating.tsx
    Badge.tsx
    AIBadge.tsx            ← violet gradient badge
  /builder
    PCBuilder.tsx
    CompatibilityChecker.tsx
    AIChatWidget.tsx

/lib
  /types.ts               ← Product, Category, Build, Order types
  /store.ts               ← Zustand stores
  /utils.ts
  /constants.ts           ← colors, categories, mock data

/public
  /images
  /icons

Generate:
1. tailwind.config.ts with full design tokens
2. app/layout.tsx with Inter + JetBrains Mono fonts
3. lib/types.ts with all TypeScript interfaces
4. lib/constants.ts with CATEGORIES, MOCK_PRODUCTS, TRUST_BADGES arrays
5. app/globals.css with base styles

TypeScript interfaces needed:
interface Product {
  id: string
  slug: string
  name: string
  nameVi: string
  category: string
  brand: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  specs: Record<string, string>
  tags: string[]
  badge?: 'hot' | 'new' | 'sale'
  warrantyMonths: number
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  count: number
  children?: Category[]
}

interface CartItem {
  product: Product
  quantity: number
}

interface PCBuild {
  id: string
  name: string
  slots: Record<string, Product | null>
  totalPrice: number
  compatibility: CompatibilityResult
  isPublic: boolean
  authorName: string
  likes: number
  views: number
}
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT A — HEADER COMPONENT
## Digitax: Top announcement bar + Main header + Mega nav
## ══════════════════════════════════════════════════════════════

```
Create the complete Header component for PCHub Next.js project.
Reference: Digitax Home Page 2 header layout (3-layer structure).
File: components/layout/Header.tsx (exports default + sub-components)

STRUCTURE: 3 stacked layers matching Digitax exactly:

━━━ LAYER 1: TopBar.tsx ━━━
Fixed at top, full width, height 36px
bg-red-500 text-white text-sm

LEFT (flex): "🚀 Miễn phí vận chuyển đơn từ 500.000 ₫ — Flash Sale hôm nay!"
  <marquee> or animated text if mobile

RIGHT (flex gap-4):
  Language dropdown: VI | EN (using shadcn Select)
  Currency dropdown: VNĐ | USD

━━━ LAYER 2: MainHeader.tsx ━━━
bg-white shadow-sm height: 80px sticky top-9 z-50

LEFT (w-48): Logo component
  <Link href="/">
    <span className="text-2xl font-bold text-navy">PCHub</span>
    <span className="text-xs text-gray-500 block">Linh kiện chính hãng</span>
  </Link>

CENTER (flex-1 max-w-2xl mx-8): SearchBar component
  <form className="flex border-2 border-blue rounded-lg overflow-hidden">
    <select className="px-3 py-2 border-r bg-gray-50 text-sm">
      <option>Tất cả danh mục</option>
      <option>CPU</option>
      <option>GPU</option>
      <option>RAM</option>
      <option>SSD</option>
      <option>Mainboard</option>
      <option>PSU</option>
    </select>
    <input
      type="text"
      placeholder="Tìm CPU, GPU, RAM, SSD, linh kiện..."
      className="flex-1 px-4 outline-none"
    />
    <button className="bg-blue-600 text-white px-6 hover:bg-blue-700">
      <Search size={20} />
    </button>
  </form>

RIGHT (flex items-center gap-6):
  Contact info (hidden md:flex flex-col text-xs):
    <a href="mailto:support@pchub.vn">support@pchub.vn</a>
    <a href="tel:19006789">1900-6789</a>

  Icon buttons row:
  - Wishlist: <Heart /> + badge count (useWishlistStore)
  - Cart: <ShoppingCart /> + badge count (useCartStore)
    → onClick: open CartDrawer (Zustand setCartOpen(true))
  - Account: <User /> → /account or /login

━━━ LAYER 3: MegaNav.tsx ━━━
bg-navy text-white height-12 sticky top-[116px] z-40

LEFT (w-56): Category mega menu trigger
  <button className="flex items-center gap-2 bg-blue-600 h-full px-4">
    <Menu size={20} /> Danh mục sản phẩm <ChevronDown size={16} />
  </button>

  MEGA DROPDOWN (absolute, bg-white text-gray-800, shadow-2xl, w-[900px]):
  4-column grid layout:
  Col 1 (w-48 border-r):
    Vertical list of main categories:
    each: <Link> with icon + name + count badge
    CPU | GPU | RAM | SSD | PSU | Mainboard | Case | Cooler | Monitor | Ngoại vi

  Col 2 (w-52 border-r):
    Sub-categories of hovered item:
    Example for CPU:
      Intel Core i3/i5/i7/i9
      AMD Ryzen 3/5/7/9
      HEDT / Workstation
      Budget CPU (<2tr)
    Use useState(hoveredCategory) to show relevant subs

  Col 3 (w-52 border-r):
    Brands for category:
    Intel | AMD | ASUS | MSI | Gigabyte | Corsair...

  Col 4 (flex-1):
    Featured product card (mini):
    <Image> + name + price + [Mua ngay] button
    "Nổi bật trong CPU" label

MAIN NAV LINKS (flex-1, flex items-center gap-1):
  [Trang chủ] [Sản phẩm ▾] [🖥️ PC Builder] [Build Gallery] [Blog] [⚡ Khuyến mãi] [Hỗ trợ]
  Each: hover:bg-white/10 px-4 h-full flex items-center

━━━ CartDrawer.tsx ━━━
Sheet component (shadcn) from right side, w-96
Header: "Giỏ hàng (N sản phẩm)"
Scrollable item list: each CartItem row
  <Image> 64px + name + qty controls [−][N][+] + price + [🗑]
Subtotal footer + [Xem giỏ hàng] + [Thanh toán →]

REQUIREMENTS:
- Use 'use client' for interactive parts
- MegaNav categories from CATEGORIES constant
- Cart state from useCartStore (Zustand)
- Wishlist count from useWishlistStore
- Fully responsive (hamburger menu on mobile)
- TypeScript strict mode
- All Vietnamese text
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT B — HERO SLIDER COMPONENT
## Digitax: Full-width 3-slide Revolution Slider
## ══════════════════════════════════════════════════════════════

```
Create HeroSlider.tsx for PCHub Next.js homepage.
Reference: Digitax Home Page 2 full-width hero slider (3 slides).
File: components/home/HeroSlider.tsx

TECH: Framer Motion for slide transitions + auto-play

SLIDE DATA STRUCTURE:
interface Slide {
  id: number
  bg: string           // gradient CSS string
  eyebrow: string
  title: string[]      // array of lines, each can have color
  subtitle: string
  ctaText: string
  ctaLink: string
  ctaVariant: 'blue' | 'white' | 'violet'
  image: string        // /images/hero/slide-N.png
  badge?: { text: string; color: string }
}

const slides: Slide[] = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0F1929 0%, #1e3a5f 100%)',
    eyebrow: 'MỚI NHẤT 2026',
    title: ['Extreme Grade', 'PC Gaming Setup'],
    titleColors: ['white', '#2563EB'],
    subtitle: 'Trải nghiệm gaming 4K đỉnh cao với RTX 4090 + i9-14900K. Hiệu năng không giới hạn.',
    ctaText: 'Khám phá ngay',
    ctaLink: '/shop/gpu',
    ctaVariant: 'blue',
    image: '/images/hero/rtx-4090-hero.png',
    badge: { text: 'SALE -20%', color: 'red' }
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    eyebrow: 'VỪA RA MẮT',
    title: ['Intel Core i9', '14900K — Vua Hiệu Năng'],
    titleColors: ['#0F1929', '#0F1929'],
    subtitle: '24 cores, TDP 253W, hỗ trợ DDR5-6000. Hiệu năng single-core vô đối. Sẵn hàng tại PCHub.',
    ctaText: 'Mua ngay',
    ctaLink: '/shop/cpu/intel-core-i9-14900k',
    ctaVariant: 'blue',
    image: '/images/hero/i9-14900k-hero.png',
    badge: { text: 'Chính hãng Intel', color: 'blue' }
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #4c1d95 0%, #6366F1 60%, #8B5CF6 100%)',
    eyebrow: 'CÔNG CỤ MIỄN PHÍ 🤖',
    title: ['AI PC Builder', 'Build PC Thông Minh'],
    titleColors: ['white', '#c4b5fd'],
    subtitle: 'Chọn linh kiện → AI tự động kiểm tra tương thích → Thêm vào giỏ. Hoàn toàn miễn phí.',
    ctaText: 'Bắt đầu Build',
    ctaLink: '/pc-builder',
    ctaVariant: 'white',
    image: '/images/hero/pc-builder-ui.png',
  }
]

COMPONENT STRUCTURE:
'use client'

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  // Auto-play every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => goNext(), 5000)
    return () => clearInterval(timer)
  }, [current])

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '580px' }}>
      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        {slides.map((slide, i) => i === current && (
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center"
            style={{ background: slide.bg }}
          >
            <div className="max-w-[1280px] mx-auto px-8 w-full flex items-center justify-between">
              {/* Left text content */}
              <div className="max-w-lg">
                {/* Eyebrow */}
                <span className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3 block">
                  {slide.eyebrow}
                </span>
                {/* Title lines */}
                <h1 className="text-5xl font-bold leading-tight mb-4">
                  {slide.title.map((line, idx) => (
                    <span
                      key={idx}
                      style={{ color: slide.titleColors[idx] }}
                      className="block"
                    >
                      {line}
                    </span>
                  ))}
                </h1>
                {/* Subtitle */}
                <p className="text-base mb-8 opacity-80" style={{
                  color: slide.ctaVariant === 'white' ? 'white' : '#64748B'
                }}>
                  {slide.subtitle}
                </p>
                {/* CTA */}
                <Link href={slide.ctaLink}>
                  <button className={cn(
                    'px-8 py-3 rounded-lg font-semibold text-base transition-all',
                    slide.ctaVariant === 'blue' && 'bg-blue-600 text-white hover:bg-blue-700',
                    slide.ctaVariant === 'white' && 'bg-white text-violet-700 hover:bg-gray-100',
                    slide.ctaVariant === 'violet' && 'bg-violet-600 text-white hover:bg-violet-700'
                  )}>
                    {slide.ctaText} →
                  </button>
                </Link>
              </div>

              {/* Right image */}
              <div className="relative flex-shrink-0">
                {slide.badge && (
                  <div className={cn(
                    'absolute -top-4 -right-4 z-10 px-3 py-1 rounded-full text-sm font-bold text-white',
                    slide.badge.color === 'red' && 'bg-red-500',
                    slide.badge.color === 'blue' && 'bg-blue-600',
                  )}>
                    {slide.badge.text}
                  </div>
                )}
                <Image
                  src={slide.image}
                  alt={slide.title[0]}
                  width={520}
                  height={460}
                  className="object-contain drop-shadow-2xl"
                  priority={i === 0}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Prev / Next arrows — same style as Digitax */}
      <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10
        w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center">
        <ChevronLeft size={20} />
      </button>
      <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10
        w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center">
        <ChevronRight size={20} />
      </button>

      {/* Dot navigation — same as Digitax bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i === current ? 'bg-blue-600 w-6' : 'bg-white/60'
            )}
          />
        ))}
      </div>
    </section>
  )
}

Framer Motion slideVariants:
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
}

Full TypeScript. Export default HeroSlider.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT C — TRUST BADGES COMPONENT
## Digitax: 5-column trust strip
## ══════════════════════════════════════════════════════════════

```
Create TrustBadges.tsx for PCHub Next.js.
Reference: Digitax Home Page 2 trust badges bar (5 equal columns).
File: components/home/TrustBadges.tsx

BADGE DATA:
const badges = [
  {
    icon: 'truck',        // Lucide Truck icon
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn hàng từ 500.000 ₫',
    iconColor: '#2563EB'
  },
  {
    icon: 'refresh-ccw',  // Lucide RefreshCcw
    title: 'Đổi trả 7 ngày',
    subtitle: 'Hoàn tiền 100% nếu lỗi NSX',
    iconColor: '#2563EB'
  },
  {
    icon: 'bot',          // Lucide Bot
    title: 'AI Tư vấn 24/7',
    subtitle: 'Kiểm tra tương thích miễn phí',
    iconColor: '#6366F1',
    isAI: true
  },
  {
    icon: 'shield-check', // Lucide ShieldCheck
    title: 'Bảo hành chính hãng',
    subtitle: 'CPU/GPU 36 tháng | RAM Lifetime',
    iconColor: '#2563EB'
  },
  {
    icon: 'credit-card',  // Lucide CreditCard
    title: 'Thanh toán đa dạng',
    subtitle: 'VNPay | Momo | ZaloPay | COD',
    iconColor: '#2563EB'
  }
]

COMPONENT:
export default function TrustBadges() {
  return (
    <section className="border-y border-gray-100 bg-white py-5">
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-gray-100">
          {badges.map((badge, i) => {
            const Icon = icons[badge.icon]
            return (
              <div key={i} className="flex items-center gap-3 px-6 py-2 group">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                  badge.isAI
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                    : 'bg-blue-50'
                )}>
                  <Icon
                    size={22}
                    color={badge.isAI ? 'white' : badge.iconColor}
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 leading-tight">
                    {badge.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

No 'use client' needed (static). TypeScript strict.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT D — FLASH SALE SECTION
## Digitax: Section title + countdown + product slider
## ══════════════════════════════════════════════════════════════

```
Create FlashSaleSection.tsx for PCHub Next.js.
Reference: Digitax product slider section with countdown timer.
Files:
  components/home/FlashSaleSection.tsx
  components/ui/CountdownTimer.tsx
  components/product/ProductCard.tsx  ← shared card used everywhere

━━━ CountdownTimer.tsx ━━━
'use client'
Props: { endTime: Date }

Display format: "KẾT THÚC SAU: 02 : 14 : 37"
Each unit in a red box:
  <div className="bg-red-600 text-white font-mono text-2xl font-bold w-10 h-10
    rounded flex items-center justify-center">
    {pad(hours)}
  </div>
  <span className="text-red-600 font-bold text-xl">:</span>

useEffect with setInterval(1000) to countdown.
Show days if > 24h remaining.

━━━ ProductCard.tsx ━━━
This is the SHARED card used in ALL sections.
Match Digitax product card exactly:

interface ProductCardProps {
  product: Product
  showQuickView?: boolean
  showCompare?: boolean
  size?: 'default' | 'compact'
}

CARD STRUCTURE (white bg, rounded-lg, overflow-hidden, group):

{/* Image container — same proportions as Digitax */}
<div className="relative aspect-square overflow-hidden bg-gray-50">
  {/* Badge — top-left, same as Digitax "sale"/"hot" badge */}
  {product.badge && (
    <span className={cn(
      'absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-bold text-white rounded',
      product.badge === 'sale' && 'bg-red-500',
      product.badge === 'hot' && 'bg-orange-500',
      product.badge === 'new' && 'bg-green-500',
    )}>
      {product.badge === 'sale' ? `SALE -${discount}%` : product.badge.toUpperCase()}
    </span>
  )}
  <Image src={product.images[0]} alt={product.nameVi} fill className="object-contain p-4
    transition-transform duration-300 group-hover:scale-105" />

  {/* Hover action row — same as Digitax hover overlay */}
  <div className="absolute bottom-0 left-0 right-0 bg-white/95 py-2 px-3
    flex items-center justify-center gap-2
    translate-y-full group-hover:translate-y-0 transition-transform duration-200">
    <button onClick={handleAddToCart}
      className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700">
      🛒 Thêm vào giỏ
    </button>
    <button onClick={handleWishlist}
      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50">
      <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
    </button>
    <button className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50">
      <ArrowLeftRight size={14} />
    </button>
    {showQuickView && (
      <button onClick={() => setQuickView(product)}
        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50">
        <Eye size={14} />
      </button>
    )}
  </div>
</div>

{/* Card body — same as Digitax */}
<div className="p-3">
  <Link href={`/shop/${product.category}/${product.slug}`}
    className="text-xs text-blue-600 hover:underline">
    {product.category}
  </Link>
  <h3 className="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 min-h-[2.5rem]
    hover:text-blue-600 transition-colors">
    <Link href={`/shop/${product.category}/${product.slug}`}>
      {product.nameVi}
    </Link>
  </h3>
  <StarRating rating={product.rating} count={product.reviewCount} className="my-1.5" />

  {/* Price — always JetBrains Mono same as Digitax */}
  <PriceDisplay price={product.price} originalPrice={product.originalPrice} />
</div>

━━━ PriceDisplay.tsx ━━━
interface PriceDisplayProps {
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
}

Format: "13.990.000 ₫" using vi-VN locale
<div className="flex items-center gap-2 flex-wrap">
  <span className="font-bold text-blue-600 font-mono"
    style={{ fontFamily: 'JetBrains Mono' }}>
    {formatVND(price)}
  </span>
  {originalPrice && (
    <span className="text-gray-400 line-through text-sm font-mono">
      {formatVND(originalPrice)}
    </span>
  )}
</div>

function formatVND(amount: number) {
  return amount.toLocaleString('vi-VN') + ' ₫'
}

━━━ FlashSaleSection.tsx ━━━
'use client'

FLASH_SALE_PRODUCTS: Product[] — 8 mock products with sale badges

LAYOUT (same as Digitax section):
<section className="py-10 bg-white">
  <div className="max-w-[1280px] mx-auto px-4">
    {/* Section header — same as Digitax */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">⚡ Flash Sale — Hôm Nay</h2>
        <CountdownTimer endTime={saleEndTime} />
      </div>
      <Link href="/flash-sale" className="text-blue-600 hover:underline text-sm font-medium">
        Xem tất cả →
      </Link>
    </div>

    {/* Product slider — same as Digitax horizontal scroll */}
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {FLASH_SALE_PRODUCTS.map(product => (
          <div key={product.id} className="flex-shrink-0 w-[220px]">
            <ProductCard product={product} showQuickView />
          </div>
        ))}
      </div>

      {/* Arrow buttons — same as Digitax */}
      <button onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border
        rounded-full shadow hover:shadow-md flex items-center justify-center">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border
        rounded-full shadow hover:shadow-md flex items-center justify-center">
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
</section>

Full TypeScript, Zustand for cart/wishlist actions.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT E — CATEGORY GRID COMPONENT
## Digitax: 5×2 grid category icons with hover
## ══════════════════════════════════════════════════════════════

```
Create CategoryGrid.tsx for PCHub Next.js.
Reference: Digitax 5×2 category grid with image cards.
File: components/home/CategoryGrid.tsx

CATEGORIES DATA:
const CATEGORIES = [
  { name: 'CPU', slug: 'cpu', icon: '/icons/cpu.svg', count: 234, color: '#3B82F6' },
  { name: 'GPU', slug: 'gpu', icon: '/icons/gpu.svg', count: 198, color: '#8B5CF6' },
  { name: 'RAM', slug: 'ram', icon: '/icons/ram.svg', count: 124, color: '#10B981' },
  { name: 'SSD & Storage', slug: 'ssd', icon: '/icons/ssd.svg', count: 189, color: '#F59E0B' },
  { name: 'Nguồn PSU', slug: 'psu', icon: '/icons/psu.svg', count: 67, color: '#EF4444' },
  { name: 'Mainboard', slug: 'mainboard', icon: '/icons/mainboard.svg', count: 89, color: '#06B6D4' },
  { name: 'Thùng máy', slug: 'case', icon: '/icons/case.svg', count: 54, color: '#84CC16' },
  { name: 'Tản nhiệt', slug: 'cooler', icon: '/icons/cooler.svg', count: 47, color: '#F97316' },
  { name: 'Màn hình', slug: 'monitor', icon: '/icons/monitor.svg', count: 124, color: '#6366F1' },
  { name: 'Ngoại vi', slug: 'peripheral', icon: '/icons/peripheral.svg', count: 312, color: '#EC4899' },
]

COMPONENT:
export default function CategoryGrid() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Section title — same as Digitax */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Mua theo danh mục
        </h2>

        {/* 5×2 grid — exact same proportions as Digitax */}
        <div className="grid grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/shop/${cat.slug}`}>
              <div className="group bg-white rounded-xl p-4 text-center cursor-pointer
                border border-gray-100 hover:border-blue-200 hover:shadow-lg
                transition-all duration-200">

                {/* Category image/icon — same aspect as Digitax */}
                <div className="aspect-square mb-3 relative flex items-center justify-center
                  rounded-lg overflow-hidden"
                  style={{ backgroundColor: `${cat.color}15` }}>
                  <Image
                    src={cat.icon}
                    alt={cat.name}
                    width={80}
                    height={80}
                    className="object-contain transition-transform duration-200
                      group-hover:scale-110"
                  />
                </div>

                {/* Category name — same text style as Digitax */}
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600
                  transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{cat.count} sản phẩm</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

Static component. No 'use client'. TypeScript.
Mobile: grid-cols-2 sm:grid-cols-3 md:grid-cols-5
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT F — TABBED PRODUCTS SECTION
## Digitax: Left sidebar image + sub-tabs + 3×2 product grid
## ══════════════════════════════════════════════════════════════

```
Create TabbedProducts.tsx for PCHub Next.js.
Reference: Digitax tabbed product sections (Smartphone/Computer/Camera).
File: components/home/TabbedProducts.tsx

STRUCTURE: 3 tab groups, each identical layout to Digitax.

TAB_GROUPS data:
const TAB_GROUPS = [
  {
    id: 'cpu',
    label: 'CPU',
    image: '/images/categories/cpu-feature.png',
    subTabs: ['Intel Core', 'AMD Ryzen', 'HEDT / Workstation', 'Budget CPU'],
    products: MOCK_CPU_PRODUCTS, // 6 products per subTab
  },
  {
    id: 'gpu',
    label: 'GPU',
    image: '/images/categories/gpu-feature.png',
    subTabs: ['NVIDIA RTX 4000', 'NVIDIA RTX 3000', 'AMD RX 7000', 'Budget GPU'],
    products: MOCK_GPU_PRODUCTS,
  },
  {
    id: 'ram-ssd',
    label: 'RAM & SSD',
    image: '/images/categories/ram-feature.png',
    subTabs: ['DDR5 RAM', 'DDR4 RAM', 'SSD NVMe', 'SSD SATA'],
    products: MOCK_RAM_PRODUCTS,
  }
]

COMPONENT LAYOUT (matches Digitax exactly):
'use client'

export default function TabbedProducts() {
  const [activeGroup, setActiveGroup] = useState('cpu')
  const [activeSubTab, setActiveSubTab] = useState(0)

  const group = TAB_GROUPS.find(g => g.id === activeGroup)!
  const displayProducts = group.products[activeSubTab] ?? group.products[0]

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1280px] mx-auto px-4">

        {/* MAIN TABS — CPU / GPU / RAM&SSD (same as Digitax top tab row) */}
        <div className="flex border-b border-gray-200 mb-8 gap-0">
          {TAB_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => { setActiveGroup(g.id); setActiveSubTab(0) }}
              className={cn(
                'px-8 py-3 text-base font-semibold transition-all border-b-2 -mb-px',
                activeGroup === g.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* CONTENT: 30% sidebar + 70% grid (same as Digitax) */}
        <div className="flex gap-6">

          {/* LEFT SIDEBAR — same structure as Digitax */}
          <div className="w-64 flex-shrink-0">
            {/* Category feature image */}
            <div className="rounded-xl overflow-hidden mb-4 aspect-[3/4]">
              <Image
                src={group.image}
                alt={group.label}
                width={256}
                height={340}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Sub-category tabs — vertical list same as Digitax */}
            <div className="space-y-1">
              {group.subTabs.map((sub, i) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubTab(i)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all',
                    activeSubTab === i
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {sub}
                  {activeSubTab === i && <ChevronRight className="float-right mt-0.5" size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT GRID — 3×2 same as Digitax */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4">
              {displayProducts.slice(0, 6).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showQuickView
                  showCompare
                />
              ))}
            </div>

            {/* View all link — same as Digitax */}
            <div className="text-center mt-6">
              <Link
                href={`/shop/${activeGroup}`}
                className="inline-flex items-center gap-2 text-blue-600 border border-blue-600
                  px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Xem tất cả {group.label} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

Use AnimatePresence for smooth tab content transitions.
Full TypeScript. 'use client'.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT G — PROMO BANNER
## Digitax: Full-width promotional banner with product image
## ══════════════════════════════════════════════════════════════

```
Create PromoBanner.tsx for PCHub Next.js.
Reference: Digitax full-width promo banner between sections.
File: components/home/PromoBanner.tsx

COMPONENT:
export default function PromoBanner() {
  return (
    <section className="my-8">
      <div className="max-w-[1280px] mx-auto px-4">
        <div
          className="relative rounded-2xl overflow-hidden flex items-center"
          style={{
            background: 'linear-gradient(135deg, #0F1929 0%, #1e1b4b 50%, #4c1d95 100%)',
            minHeight: '220px'
          }}
        >
          {/* Decorative bg circles */}
          <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full
            bg-violet-500/10 -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full
            bg-blue-500/10 translate-y-1/2" />

          {/* LEFT TEXT — same layout as Digitax */}
          <div className="relative z-10 px-12 py-10 flex-1">
            <span className="text-xs font-bold tracking-widest text-violet-400 uppercase mb-2 block">
              🤖 AI POWERED — MIỄN PHÍ
            </span>
            <h2 className="text-3xl font-bold text-white mb-2">
              Build PC Gaming
            </h2>
            <h2 className="text-3xl font-bold mb-4"
              style={{ background: 'linear-gradient(to right, #a78bfa, #c4b5fd)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Với AI Tư vấn Miễn Phí
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md">
              Chọn linh kiện → AI tự động kiểm tra tương thích → Thêm vào giỏ hàng.
              Hoàn toàn miễn phí. Không cần đăng ký.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/pc-builder">
                <button className="px-6 py-3 rounded-lg font-semibold text-violet-900
                  bg-gradient-to-r from-violet-400 to-purple-400
                  hover:from-violet-500 hover:to-purple-500 transition-all">
                  🖥️ Thử PC Builder ngay →
                </button>
              </Link>
              <Link href="/builds" className="text-gray-400 hover:text-white text-sm transition-colors">
                Xem cộng đồng →
              </Link>
            </div>

            {/* Trust mini badges — same positioning as Digitax badge row */}
            <div className="flex items-center gap-6 mt-6">
              {['✅ AI kiểm tra 10 thông số', '✅ 1-click thêm giỏ', '✅ Lưu & chia sẻ'].map(t => (
                <span key={t} className="text-xs text-gray-400">{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE — same position as Digitax banner product */}
          <div className="relative flex-shrink-0 pr-8">
            {/* Trust badge overlay — same as Digitax */}
            <div className="absolute -top-3 -left-4 z-20 bg-white rounded-lg px-3 py-2 shadow-lg">
              <span className="text-xs font-bold text-green-600">✅ AI Kiểm tra</span>
              <p className="text-xs text-gray-500">100% Tương thích</p>
            </div>
            <Image
              src="/images/promo/pc-builder-preview.png"
              alt="PCHub AI PC Builder"
              width={360}
              height={280}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

Static. No 'use client'. TypeScript.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT H — MOST VIEWED + AI BUILDER PREVIEW + COMMUNITY BUILDS
## Digitax: Most Viewed 5-col + 2 PCHub-exclusive sections
## ══════════════════════════════════════════════════════════════

```
Create 3 components for PCHub Next.js homepage.
Files:
  components/home/MostViewed.tsx
  components/home/AIBuilderPreview.tsx
  components/home/CommunityBuilds.tsx

━━━ MostViewed.tsx ━━━
Reference: Digitax "Most Viewed Products" 5-column grid.

Tabs: [Xem nhiều nhất] [Bán chạy nhất] [Đánh giá cao]
'use client' — tab switching

5 compact ProductCards in a row:
<div className="grid grid-cols-5 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} size="compact" />)}
</div>

Size "compact" variant of ProductCard:
- No hover action row
- Show [Thêm giỏ] button always visible below price
- Smaller padding

━━━ AIBuilderPreview.tsx ━━━
PCHub exclusive — not in Digitax.

<section className="py-12" style={{
  background: 'linear-gradient(135deg, #4c1d95 0%, #6366F1 100%)'
}}>
  <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-12">

    {/* LEFT TEXT */}
    <div className="flex-1">
      <span className="text-xs text-violet-300 font-bold tracking-widest uppercase">
        CÔNG CỤ MIỄN PHÍ
      </span>
      <h2 className="text-4xl font-bold text-white mt-2 mb-4">
        🖥️ Xây dựng PC<br/>theo ý bạn
      </h2>
      <p className="text-violet-200 mb-6">
        Chọn linh kiện — AI tự động kiểm tra tương thích
        — Nhận cấu hình hoàn hảo
      </p>

      {/* Mini benefit row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '✅', text: 'AI kiểm tra\n10 thông số' },
          { icon: '🛒', text: '1-click\nthêm giỏ hàng' },
          { icon: '💾', text: 'Lưu & chia sẻ\nbuild của bạn' },
        ].map((b, i) => (
          <div key={i} className="bg-white/10 rounded-lg p-3 text-center">
            <span className="text-2xl block mb-1">{b.icon}</span>
            <p className="text-xs text-violet-200 whitespace-pre-line">{b.text}</p>
          </div>
        ))}
      </div>

      <Link href="/pc-builder">
        <button className="bg-white text-violet-700 font-bold px-8 py-3 rounded-lg
          hover:bg-gray-100 transition-colors text-base">
          Thử PC Builder ngay →
        </button>
      </Link>
    </div>

    {/* RIGHT — Mini PC Builder UI preview */}
    <div className="flex-shrink-0 w-[420px]">
      {/* Mini slot preview — illustrate the PC builder */}
      <div className="bg-white rounded-2xl p-4 shadow-2xl">
        <p className="text-xs font-bold text-gray-500 mb-3">🖥️ PC Builder — Preview</p>
        {[
          { label: 'CPU', product: 'Intel Core i9-14900K', status: 'ok', price: '13.990.000 ₫' },
          { label: 'GPU', product: 'Chưa chọn', status: 'empty', price: '' },
          { label: 'RAM', product: 'Corsair 64GB DDR5', status: 'ok', price: '3.980.000 ₫' },
          { label: 'PSU', product: 'Corsair RM750x', status: 'warn', price: '2.890.000 ₫' },
        ].map((slot) => (
          <div key={slot.label} className={cn(
            'flex items-center gap-3 p-2 rounded-lg mb-2 border',
            slot.status === 'ok' && 'border-green-100 bg-green-50',
            slot.status === 'warn' && 'border-orange-100 bg-orange-50',
            slot.status === 'empty' && 'border-dashed border-gray-200',
          )}>
            <span className="text-xs font-bold text-gray-500 w-10">{slot.label}</span>
            <span className={cn(
              'flex-1 text-xs',
              slot.status === 'empty' ? 'text-gray-400 italic' : 'text-gray-700 font-medium'
            )}>
              {slot.product}
            </span>
            {slot.status === 'ok' && <span className="text-green-600 text-xs">✅</span>}
            {slot.status === 'warn' && <span className="text-orange-500 text-xs">⚠️</span>}
            {slot.price && (
              <span className="text-xs font-mono font-bold text-blue-600">{slot.price}</span>
            )}
          </div>
        ))}
        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">Tạm tính:</span>
          <span className="font-mono font-bold text-blue-600 text-sm">40.920.000 ₫</span>
        </div>
        <button className="w-full mt-2 bg-blue-600 text-white text-xs py-2 rounded-lg font-semibold">
          🛒 Thêm tất cả vào giỏ hàng
        </button>
      </div>

      {/* AI badge */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div className="flex-1 h-px bg-white/20"/>
        <span className="text-xs text-violet-300 px-2">🤖 AI đang kiểm tra tương thích...</span>
        <div className="flex-1 h-px bg-white/20"/>
      </div>
    </div>
  </div>
</section>

━━━ CommunityBuilds.tsx ━━━
PCHub exclusive — not in Digitax.
Matches Digitax blog grid layout (3-column, same card structure).

interface BuildCard {
  id: string
  name: string
  image: string
  tags: string[]
  priceRange: string
  authorName: string
  authorAvatar: string
  components: string
  totalPrice: number
  likes: number
  views: number
  isVerified: boolean
}

<section className="py-10 bg-gray-50">
  <div className="max-w-[1280px] mx-auto px-4">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">🖥️ Cấu hình từ cộng đồng</h2>
      <Link href="/builds" className="text-blue-600 hover:underline text-sm">Xem tất cả →</Link>
    </div>

    <div className="grid grid-cols-3 gap-6">
      {COMMUNITY_BUILDS.map(build => (
        <div key={build.id} className="bg-white rounded-xl overflow-hidden border border-gray-100
          hover:shadow-lg transition-shadow group">

          {/* Thumbnail — same 16:9 as Digitax blog card */}
          <div className="aspect-video relative overflow-hidden bg-gray-100">
            <Image src={build.image} alt={build.name} fill className="object-cover
              group-hover:scale-105 transition-transform duration-300" />
            {/* Tags overlay */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {build.tags.map(tag => (
                <span key={tag} className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card body — same structure as Digitax blog card */}
          <div className="p-4">
            {/* Author + stats */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image src={build.authorAvatar} alt="" width={24} height={24}
                  className="rounded-full" />
                <span className="text-xs text-gray-500">{build.authorName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>❤️ {build.likes}</span>
                <span>👁 {build.views.toLocaleString()}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              {build.name}
            </h3>

            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{build.components}</p>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-blue-600 text-sm">
                  {build.totalPrice.toLocaleString('vi-VN')} ₫
                </span>
                {build.isVerified && (
                  <span className="ml-2 text-xs text-green-600">✅ Đã kiểm tra</span>
                )}
              </div>
              <Link href={`/builds/${build.id}`}>
                <button className="text-xs text-blue-600 border border-blue-600 px-3 py-1
                  rounded hover:bg-blue-50 transition-colors">
                  Xem & Sao chép
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

All 3 components TypeScript strict. CommunityBuilds and AIBuilderPreview are static (no 'use client').
MostViewed needs 'use client' for tab state.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT I — TESTIMONIALS + BLOG + BRANDS
## Digitax: Reviews slider + 5-col news + brand logos
## ══════════════════════════════════════════════════════════════

```
Create 3 components for PCHub Next.js homepage.
Files:
  components/home/Testimonials.tsx
  components/home/BlogSection.tsx
  components/home/BrandStrip.tsx

━━━ Testimonials.tsx ━━━
Reference: Digitax testimonial slider (4 quotes, 2 visible).
'use client' — Framer Motion carousel

interface Testimonial {
  id: number
  quote: string
  name: string
  role: string
  avatar: string
  rating: 5 | 4 | 3
  productBought: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    quote: "PCHub có AI tư vấn cực kỳ thông minh! Mình chỉ nói budget 25tr, AI gợi ý ngay cấu hình gaming chuẩn không cần chỉnh. Mua xong hài lòng 100%.",
    name: "Nguyễn Văn Bình",
    role: "Gamer — TP.HCM",
    avatar: "/avatars/user1.jpg",
    rating: 5,
    productBought: "RTX 4070 Ti Super"
  },
  {
    id: 2,
    quote: "Hàng chính hãng, đóng gói cẩn thận, giao GHN cực nhanh. i9-14900K về trong ngày. PCHub là địa chỉ uy tín nhất mình từng mua linh kiện.",
    name: "Trần Thị Mai",
    role: "Kỹ sư phần mềm — Hà Nội",
    avatar: "/avatars/user2.jpg",
    rating: 5,
    productBought: "Intel Core i9-14900K"
  },
  {
    id: 3,
    quote: "Công cụ PC Builder quá tiện! Chọn linh kiện xong AI báo ngay PSU 750W không đủ cho RTX 4090. Tư vấn kịp thời, saved mình khỏi lỗi đắt tiền.",
    name: "Lê Minh Tuấn",
    role: "Content Creator — Đà Nẵng",
    avatar: "/avatars/user3.jpg",
    rating: 5,
    productBought: "RTX 4090 ASUS ROG"
  },
  {
    id: 4,
    quote: "Bảo hành 36 tháng không lo. RTX 4070 Ti bị artifact sau 8 tháng, PCHub đổi card mới trong 5 ngày không hỏi nhiều. Dịch vụ hậu mãi tốt nhất.",
    name: "Hoàng Văn Cường",
    role: "Streamer — TP.HCM",
    avatar: "/avatars/user4.jpg",
    rating: 5,
    productBought: "RTX 4070 Ti ASUS"
  }
]

LAYOUT (matches Digitax testimonials):
<section className="py-12 bg-gray-50">
  <div className="max-w-[1280px] mx-auto px-4">
    <h2 className="text-2xl font-bold text-center mb-8">
      ⭐ Khách hàng nói gì về PCHub
    </h2>

    {/* 2-card carousel — same as Digitax */}
    <div className="relative overflow-hidden">
      <div className="flex gap-6" style={{ transform: `translateX(-${current * 50}%)`,
        transition: 'transform 0.4s ease' }}>
        {TESTIMONIALS.map(t => (
          <div key={t.id} className="flex-shrink-0 w-[calc(50%-12px)] bg-white rounded-xl
            p-8 shadow-sm border border-gray-100">

            {/* Large quote mark — same as Digitax */}
            <span className="text-7xl text-gray-100 font-serif leading-none block -mb-4">"</span>

            <StarRating rating={t.rating} className="mb-4" />
            <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.quote}"</p>

            {/* Author — same as Digitax avatar + name + role */}
            <div className="flex items-center gap-3">
              <Image src={t.avatar} alt={t.name} width={48} height={48}
                className="rounded-full ring-2 ring-blue-100" />
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">
                Mua: {t.productBought}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows — same as Digitax */}
      <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4
        w-9 h-9 bg-white border shadow rounded-full flex items-center justify-center">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4
        w-9 h-9 bg-white border shadow rounded-full flex items-center justify-center">
        <ChevronRight size={18} />
      </button>
    </div>

    {/* Dots — same as Digitax */}
    <div className="flex justify-center gap-2 mt-6">
      {[0, 1].map(i => (
        <button key={i} onClick={() => setCurrent(i)}
          className={cn('w-2 h-2 rounded-full transition-all',
            current === i ? 'bg-blue-600 w-6' : 'bg-gray-300')} />
      ))}
    </div>
  </div>
</section>

━━━ BlogSection.tsx ━━━
Reference: Digitax "Latest News" 5-column grid.

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  thumbnail: string
  category: string
  categoryColor: string
  date: string
  readTime: number
  author: string
}

5-column grid:
<div className="grid grid-cols-5 gap-5">
  {BLOG_POSTS.map(post => (
    <Link key={post.id} href={`/blog/${post.slug}`}>
      <article className="group cursor-pointer">
        {/* Thumbnail — same 16:9 ratio as Digitax */}
        <div className="aspect-video rounded-xl overflow-hidden mb-3">
          <Image src={post.thumbnail} alt={post.title}
            width={240} height={135}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Meta — same format as Digitax */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>{post.date}</span>
          <span>•</span>
          <span style={{ color: post.categoryColor }}
            className="font-medium">{post.category}</span>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2
          group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>

        {/* Read more — same link style as Digitax */}
        <span className="text-xs text-blue-600 font-medium group-hover:underline">
          Đọc thêm → {post.readTime} phút đọc
        </span>
      </article>
    </Link>
  ))}
</div>

━━━ BrandStrip.tsx ━━━
Reference: Digitax horizontal brand logos auto-scroll.

const BRANDS = [
  { name: 'Intel', logo: '/brands/intel.svg' },
  { name: 'AMD', logo: '/brands/amd.svg' },
  { name: 'NVIDIA', logo: '/brands/nvidia.svg' },
  { name: 'ASUS', logo: '/brands/asus.svg' },
  { name: 'MSI', logo: '/brands/msi.svg' },
  { name: 'Corsair', logo: '/brands/corsair.svg' },
  { name: 'Samsung', logo: '/brands/samsung.svg' },
  { name: 'Gigabyte', logo: '/brands/gigabyte.svg' },
  { name: 'Kingston', logo: '/brands/kingston.svg' },
  { name: 'WD', logo: '/brands/wd.svg' },
  { name: 'Noctua', logo: '/brands/noctua.svg' },
  { name: 'Lian Li', logo: '/brands/lianli.svg' },
]

Auto-scroll marquee (CSS animation, no JS needed):
<section className="py-8 border-y border-gray-100 overflow-hidden bg-white">
  <div className="flex" style={{ animation: 'marquee 30s linear infinite' }}>
    {[...BRANDS, ...BRANDS].map((brand, i) => (
      <Link key={i} href={`/shop?brand=${brand.name.toLowerCase()}`}
        className="flex-shrink-0 mx-8 grayscale hover:grayscale-0 opacity-60
          hover:opacity-100 transition-all">
        <Image src={brand.logo} alt={brand.name} width={100} height={40}
          className="object-contain h-10" />
      </Link>
    ))}
  </div>
</section>

CSS in globals.css:
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

All 3 components TypeScript. Testimonials 'use client', others static.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT J — FOOTER COMPONENT
## Digitax: 4-col dark footer + newsletter + payment + social
## ══════════════════════════════════════════════════════════════

```
Create Footer.tsx for PCHub Next.js.
Reference: Digitax 4-column dark footer layout.
File: components/layout/Footer.tsx

STRUCTURE matches Digitax exactly:

export default function Footer() {
  return (
    <footer className="bg-navy text-gray-300">

      {/* MAIN FOOTER — 4 columns same as Digitax */}
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8">

          {/* COL 1 — About + Contact (same as Digitax) */}
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-white">PCHub</span>
              <p className="text-xs text-gray-500 mt-0.5">Linh kiện chính hãng</p>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Chuyên cung cấp linh kiện máy tính chính hãng.
              AI tư vấn tương thích 24/7. Bảo hành 36 tháng.
            </p>
            <div className="space-y-2 text-sm">
              {[
                { icon: MapPin, text: '123 Nguyễn Trãi, Q.1, TP.HCM' },
                { icon: Phone, text: '1900-6789 (8:00–22:00)' },
                { icon: Mail, text: 'support@pchub.vn' },
                { icon: Clock, text: 'Mở cửa 7 ngày | 8:00–20:00' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon size={14} className="mt-0.5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2 — Store Locations (same as Digitax) */}
          <div>
            <h3 className="font-bold text-white mb-4">Cửa hàng PCHub</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                'TP.HCM — 123 Nguyễn Trãi, Q.1',
                'TP.HCM — 456 Lê Văn Việt, Q.9',
                'Hà Nội — 789 Cầu Giấy',
                'Đà Nẵng — 321 Nguyễn Văn Linh',
                'Cần Thơ — 654 Trần Hưng Đạo',
              ].map(loc => (
                <li key={loc}>
                  <Link href="#" className="hover:text-white transition-colors">
                    • {loc}
                  </Link>
                </li>
              ))}
              <li><Link href="/stores" className="text-blue-400 hover:underline">Xem tất cả →</Link></li>
            </ul>
          </div>

          {/* COL 3 — Information (same as Digitax) */}
          <div>
            <h3 className="font-bold text-white mb-4">Thông tin</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'Về PCHub', href: '/about' },
                { label: 'Liên hệ', href: '/contact' },
                { label: 'Chính sách bảo hành', href: '/warranty-policy' },
                { label: 'Chính sách đổi trả', href: '/return-policy' },
                { label: 'Hướng dẫn mua hàng', href: '/guide' },
                { label: 'Blog & Hướng dẫn', href: '/blog' },
                { label: 'Tuyển dụng', href: '/careers' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Product Categories (PCHub addition) */}
          <div>
            <h3 className="font-bold text-white mb-4">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'CPU — Bộ xử lý', href: '/shop/cpu' },
                { label: 'GPU — Card đồ họa', href: '/shop/gpu' },
                { label: 'RAM — Bộ nhớ', href: '/shop/ram' },
                { label: 'SSD & Storage', href: '/shop/ssd' },
                { label: 'Mainboard', href: '/shop/mainboard' },
                { label: 'PSU — Nguồn', href: '/shop/psu' },
                { label: '🖥️ PC Builder', href: '/pc-builder' },
                { label: '👥 Build Gallery', href: '/builds' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors
                    flex items-center gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* NEWSLETTER BAR — same full-width as Digitax */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between gap-8">
          <div>
            <h3 className="font-bold text-white">Đăng ký nhận tin</h3>
            <p className="text-sm text-gray-400">Giảm ngay 10% đơn đầu tiên + tin tức công nghệ mỗi tuần</p>
          </div>
          <form className="flex gap-2 min-w-[400px]">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2
                text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 text-sm"
            />
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg
                text-sm font-semibold whitespace-nowrap transition-colors">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM BAR — payment logos + social + copyright (same as Digitax) */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between">

          {/* Payment logos — same row as Digitax */}
          <div className="flex items-center gap-3">
            {['vnpay', 'momo', 'zalopay', 'visa', 'mastercard', 'jcb'].map(p => (
              <Image key={p} src={`/payments/${p}.svg`} alt={p}
                width={40} height={24} className="opacity-70 hover:opacity-100 transition-opacity" />
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500">
            PCHub © 2026. All Rights Reserved.
          </p>

          {/* Social icons — same as Digitax */}
          <div className="flex items-center gap-3">
            {[
              { icon: Facebook, href: 'https://facebook.com/pchub' },
              { icon: Youtube, href: 'https://youtube.com/pchub' },
              { icon: Instagram, href: 'https://instagram.com/pchub' },
            ].map(({ icon: Icon, href }) => (
              <a key={href} href={href} target="_blank"
                className="w-8 h-8 bg-white/10 hover:bg-blue-600 rounded-full
                  flex items-center justify-center transition-colors">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  )
}

Static. No 'use client'. TypeScript strict.
```

---

## ══════════════════════════════════════════════════════════════
## PROMPT K — HOMEPAGE ASSEMBLY (app/page.tsx)
## Ghép tất cả component thành trang hoàn chỉnh
## ══════════════════════════════════════════════════════════════

```
Create the complete homepage file for PCHub Next.js.
File: app/page.tsx

This assembles all components in the exact same order as Digitax Home Page 2.

import type { Metadata } from 'next'

// Layout components
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Home sections — same order as Digitax
import HeroSlider from '@/components/home/HeroSlider'
import TrustBadges from '@/components/home/TrustBadges'
import FlashSaleSection from '@/components/home/FlashSaleSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import TabbedProducts from '@/components/home/TabbedProducts'
import PromoBanner from '@/components/home/PromoBanner'
import MostViewed from '@/components/home/MostViewed'
import AIBuilderPreview from '@/components/home/AIBuilderPreview'
import CommunityBuilds from '@/components/home/CommunityBuilds'
import Testimonials from '@/components/home/Testimonials'
import BlogSection from '@/components/home/BlogSection'
import BrandStrip from '@/components/home/BrandStrip'

export const metadata: Metadata = {
  title: 'PCHub — Linh kiện PC chính hãng | AI tư vấn tương thích 24/7',
  description: 'Mua linh kiện máy tính CPU GPU RAM SSD chính hãng. AI tư vấn build PC, kiểm tra tương thích miễn phí. Bảo hành 36 tháng.',
  openGraph: {
    title: 'PCHub — Linh kiện PC chính hãng',
    description: 'AI tư vấn build PC, kiểm tra tương thích miễn phí',
    url: 'https://pchub.vn',
    siteName: 'PCHub',
    locale: 'vi_VN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://pchub.vn'
  }
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* 1. HERO SLIDER — Full width, same as Digitax */}
        <HeroSlider />

        {/* 2. TRUST BADGES — 5 columns, same as Digitax */}
        <TrustBadges />

        {/* 3. FLASH SALE — Countdown + product slider, same as Digitax */}
        <FlashSaleSection />

        {/* 4. CATEGORY GRID — 5×2 icons, same as Digitax */}
        <CategoryGrid />

        {/* 5. TABBED PRODUCTS — Sidebar + 3×2 grid × 3 tabs, same as Digitax */}
        <TabbedProducts />

        {/* 6. PROMO BANNER — Full width CTA, same as Digitax */}
        <PromoBanner />

        {/* 7. MOST VIEWED — 5-column, same as Digitax */}
        <MostViewed />

        {/* 8. AI BUILDER PREVIEW — PCHub exclusive (violet) */}
        <AIBuilderPreview />

        {/* 9. COMMUNITY BUILDS — PCHub exclusive (blog grid style) */}
        <CommunityBuilds />

        {/* 10. TESTIMONIALS — Slider, same as Digitax */}
        <Testimonials />

        {/* 11. BLOG — 5-column news, same as Digitax */}
        <BlogSection />

        {/* 12. BRAND LOGOS — Auto-scroll strip, same as Digitax */}
        <BrandStrip />
      </main>

      <Footer />
    </>
  )
}

Also create app/layout.tsx:

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

Also create app/providers.tsx (Zustand + ThemeProvider if needed):
'use client'
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

Also create lib/store.ts with Zustand:

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  setOpen: (open: boolean) => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, qty = 1) => set(state => {
        const exists = state.items.find(i => i.product.id === product.id)
        if (exists) {
          return { items: state.items.map(i =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
          )}
        }
        return { items: [...state.items, { product, quantity: qty }] }
      }),
      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.product.id !== id)
      })),
      updateQty: (id, qty) => set(state => ({
        items: qty <= 0
          ? state.items.filter(i => i.product.id !== id)
          : state.items.map(i => i.product.id === id ? { ...i, quantity: qty } : i)
      })),
      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: 'pchub-cart' }
  )
)

interface WishlistStore {
  ids: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set(state => ({
        ids: state.ids.includes(id)
          ? state.ids.filter(i => i !== id)
          : [...state.ids, id]
      })),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'pchub-wishlist' }
  )
)

TypeScript strict throughout. Generate complete, runnable code.
```

---

## ══════════════════════════════════════════════════════════════
## BẢNG ĐỐI CHIẾU COMPONENT
## ══════════════════════════════════════════════════════════════

| Prompt | Component | File | 'use client' |
|--------|-----------|------|--------------|
| 0      | Project setup | tailwind.config + types + store | — |
| A      | Header | components/layout/Header.tsx | ✅ |
| B      | HeroSlider | components/home/HeroSlider.tsx | ✅ |
| C      | TrustBadges | components/home/TrustBadges.tsx | ❌ |
| D      | FlashSaleSection + ProductCard + PriceDisplay | components/home/ + product/ + ui/ | ✅ |
| E      | CategoryGrid | components/home/CategoryGrid.tsx | ❌ |
| F      | TabbedProducts | components/home/TabbedProducts.tsx | ✅ |
| G      | PromoBanner | components/home/PromoBanner.tsx | ❌ |
| H      | MostViewed + AIBuilderPreview + CommunityBuilds | components/home/ | ✅/❌/❌ |
| I      | Testimonials + BlogSection + BrandStrip | components/home/ | ✅/❌/❌ |
| J      | Footer | components/layout/Footer.tsx | ❌ |
| K      | app/page.tsx + layout.tsx + providers.tsx + store.ts | app/ + lib/ | — |
