"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────── */
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceIqd: number;
  photoUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
};
type Category = { id: string; name: string; menuItems: MenuItem[] };
type OpeningHour = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};
type Offer = {
  id: string;
  title: string;
  description: string | null;
  priceIqd: number | null;
  photoUrl: string | null;
};
type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string | null;
  instagramUrl: string | null;
  locationText: string | null;
  googleMapsUrl: string | null;
  categories: Category[];
  openingHours: OpeningHour[];
};
interface Props {
  restaurant: Restaurant;
  activeOffers: Offer[];
}

/* ─── Item image placeholder gradients (cycles c1–c5) ─ */
const IMG_BG = [
  "linear-gradient(135deg,#FDE8D0,#FBCBA7)",
  "linear-gradient(135deg,#D0F0E0,#A8DFC2)",
  "linear-gradient(135deg,#D0E4F8,#A7C8F0)",
  "linear-gradient(135deg,#F8E0D0,#F0BDA7)",
  "linear-gradient(135deg,#F0E8D0,#E0D0A8)",
];

/* ═══════════════════════════════════════════════════════ */
export function PublicMenuClient({ restaurant, activeOffers }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ── Derived state ── */
  const filteredCategories = useMemo(() => {
    if (!search) return restaurant.categories;
    return restaurant.categories
      .map((cat) => ({
        ...cat,
        menuItems: cat.menuItems.filter(
          (item) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((cat) => cat.menuItems.length > 0);
  }, [restaurant.categories, search]);

  const todayHours = restaurant.openingHours.find(
    (h) => h.dayOfWeek === new Date().getDay()
  );

  const isOpenNow = useMemo(() => {
    if (!todayHours || todayHours.isClosed || !todayHours.openTime || !todayHours.closeTime)
      return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = todayHours.openTime.split(":").map(Number);
    const [ch, cm] = todayHours.closeTime.split(":").map(Number);
    return nowMin >= oh * 60 + om && nowMin <= ch * 60 + cm;
  }, [todayHours]);

  /* flat index → colour cycle */
  const itemIdx = useMemo(() => {
    const m = new Map<string, number>();
    let i = 0;
    restaurant.categories.forEach((c) => c.menuItems.forEach((item) => m.set(item.id, i++)));
    return m;
  }, [restaurant.categories]);

  function goToCategory(id: string) {
    setActiveCategory(id);
    const el = sectionRefs.current[id];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 112, behavior: "smooth" });
  }

  /* ── Render ── */
  return (
    <div style={{ background: "var(--lawha-cream)", minHeight: "100vh" }}>

        {/* ══ COVER ══════════════════════════════════════════ */}
        <div style={{ height: 220, position: "relative", overflow: "hidden", flexShrink: 0 }}>
          {restaurant.coverImageUrl ? (
            <>
              <Image src={restaurant.coverImageUrl} alt={restaurant.name} fill className="object-cover" priority />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.55))" }} />
            </>
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg,#3D1F08 0%,#7A3A10 40%,#C9522A 80%,#E8822A 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "3rem", opacity: 0.2, letterSpacing: "1rem" }}>🍽️ ☕</span>
            </div>
          )}

          {/* lang switcher top-left */}
          <div style={{
            position: "absolute", top: 14, left: 14, zIndex: 2,
            display: "flex", overflow: "hidden", borderRadius: 20,
            background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            {(["EN","عربي","کوردی"] as const).map((l, i) => (
              <span key={l} style={{
                padding: "4px 8px", fontSize: "0.55rem", fontWeight: 600,
                color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)",
                background: i === 0 ? "var(--lawha-brand)" : "transparent",
                borderRadius: 20, letterSpacing: "0.05em", cursor: "pointer",
              }}>{l}</span>
            ))}
          </div>

          {/* action buttons top-right */}
          <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, display: "flex", gap: 8 }}>
            {["🔗","♡"].map((ic) => (
              <button key={ic} style={{
                width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: "0.8rem", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{ic}</button>
            ))}
          </div>

          {/* fade bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: "linear-gradient(to top,var(--lawha-cream),transparent)",
          }} />
        </div>

        {/* ══ RESTAURANT HEADER ══════════════════════════════ */}
        <div style={{ padding: "0 16px 12px", marginTop: -20, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 8 }}>
            {/* logo */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0, overflow: "hidden",
              background: restaurant.logoUrl ? undefined : "linear-gradient(135deg,var(--lawha-brand),var(--lawha-gold))",
              border: "3px solid var(--lawha-cream)",
              boxShadow: "0 4px 16px rgba(26,18,10,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {restaurant.logoUrl
                ? <Image src={restaurant.logoUrl} alt={restaurant.name} width={52} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "1.4rem" }}>☕</span>
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "var(--font-playfair,serif)", fontSize: "1.1rem",
                fontWeight: 700, color: "var(--lawha-ink)", lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{restaurant.name}</h1>
              {restaurant.locationText && (
                <p style={{ fontSize: "0.62rem", color: "var(--lawha-ink-2)", lineHeight: 1.6, marginTop: 2 }}>
                  {restaurant.locationText}
                </p>
              )}
            </div>
          </div>

          {/* open/closed badge */}
          {todayHours && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 20,
              background: isOpenNow ? "var(--lawha-green-pale)" : "var(--lawha-red-pale)",
              fontSize: "0.58rem", fontWeight: 600,
              color: isOpenNow ? "var(--lawha-green)" : "var(--lawha-red)",
            }}>
              <span className={cn(isOpenNow && "animate-blink")} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: isOpenNow ? "var(--lawha-green)" : "var(--lawha-red)",
                display: "inline-block", flexShrink: 0,
              }} />
              {todayHours.isClosed
                ? "Closed today"
                : isOpenNow
                ? `Open now · Until ${todayHours.closeTime}`
                : `Closed · Opens ${todayHours.openTime}`}
            </div>
          )}
        </div>

        {/* ══ SEARCH ═════════════════════════════════════════ */}
        <div style={{ padding: "8px 16px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1.5px solid var(--lawha-border)",
            borderRadius: 12, padding: "9px 12px",
            boxShadow: "0 1px 4px rgba(26,18,10,0.06)",
          }}>
            <Search style={{ width: 13, height: 13, color: "var(--lawha-ink-3)", flexShrink: 0 }} />
            <input
              type="search"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, background: "transparent", outline: "none", border: "none",
                fontSize: "0.65rem", color: "var(--lawha-ink)",
                fontFamily: "var(--font-sora,sans-serif)",
              }}
            />
            {search ? (
              <button onClick={() => setSearch("")} style={{ color: "var(--lawha-ink-3)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            ) : (
              <div style={{
                width: 24, height: 24, background: "var(--lawha-brand-pale)",
                borderRadius: 7, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "0.6rem", color: "var(--lawha-brand)",
                flexShrink: 0,
              }}>⚙</div>
            )}
          </div>
        </div>

        {/* ══ CATEGORY PILLS ═════════════════════════════════ */}
        {!search && restaurant.categories.length > 0 && (
          <div style={{
            display: "flex", gap: 7, padding: "12px 16px 8px",
            overflowX: "auto", scrollbarWidth: "none",
          }}>
            <button onClick={() => setActiveCategory("all")} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 12px", borderRadius: 20, flexShrink: 0,
              fontSize: "0.6rem", fontWeight: 600, whiteSpace: "nowrap",
              cursor: "pointer", transition: "all 0.2s",
              border: activeCategory === "all" ? "1.5px solid var(--lawha-brand)" : "1.5px solid var(--lawha-border)",
              background: activeCategory === "all" ? "var(--lawha-brand)" : "#fff",
              color: activeCategory === "all" ? "#fff" : "var(--lawha-ink-2)",
            }}>
              <span style={{ fontSize: "0.75rem" }}>🔥</span> All
            </button>
            {restaurant.categories.map((cat) => (
              <button key={cat.id} onClick={() => goToCategory(cat.id)} style={{
                padding: "6px 12px", borderRadius: 20, flexShrink: 0,
                fontSize: "0.6rem", fontWeight: 600, whiteSpace: "nowrap",
                cursor: "pointer", transition: "all 0.2s",
                border: activeCategory === cat.id ? "1.5px solid var(--lawha-brand)" : "1.5px solid var(--lawha-border)",
                background: activeCategory === cat.id ? "var(--lawha-brand)" : "#fff",
                color: activeCategory === cat.id ? "#fff" : "var(--lawha-ink-2)",
              }}>{cat.name}</button>
            ))}
          </div>
        )}

        {/* ══ TODAY'S OFFER ═══════════════════════════════════ */}
        {activeOffers.length > 0 && !search && (
          <>
            <div style={{ padding: "10px 16px 6px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--lawha-ink)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6 }}>
                Today&apos;s Offer
                <span style={{ flex: 1, height: 1, background: "var(--lawha-border)", display: "block" }} />
              </div>
            </div>
            {activeOffers.map((offer) => (
              <div key={offer.id} style={{
                margin: "0 16px 6px", borderRadius: 16, padding: 14,
                display: "flex", gap: 12, alignItems: "center",
                position: "relative", overflow: "hidden",
                background: "linear-gradient(135deg,#1A120A 0%,#3D1F08 60%,#6B2E08 100%)",
                boxShadow: "0 6px 20px rgba(232,98,42,0.25)",
              }}>
                {/* glow */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 100, height: 100, borderRadius: "50%", pointerEvents: "none",
                  background: "radial-gradient(circle,rgba(232,98,42,0.3) 0%,transparent 70%)",
                }} />
                {/* badge */}
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  background: "var(--lawha-brand)", color: "#fff",
                  fontSize: "0.5rem", fontWeight: 700, padding: "3px 7px",
                  borderRadius: 6, letterSpacing: "0.08em", textTransform: "uppercase",
                }}>🏷 OFFER</span>

                {/* image */}
                {offer.photoUrl ? (
                  <div style={{ width: 68, height: 68, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Image src={offer.photoUrl} alt={offer.title} width={68} height={68} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{
                    width: 68, height: 68, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,rgba(232,98,42,0.4),rgba(201,146,42,0.3))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem",
                  }}>🍽️</div>
                )}

                {/* info */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                  <p style={{ fontFamily: "var(--font-playfair,serif)", fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: 3 }}>{offer.title}</p>
                  {offer.description && (
                    <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{offer.description}</p>
                  )}
                  {offer.priceIqd && (
                    <span style={{ fontFamily: "var(--font-dm-mono,monospace)", fontSize: "0.85rem", fontWeight: 500, color: "var(--lawha-gold)" }}>{formatPrice(offer.priceIqd)}</span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══ MENU SECTIONS ══════════════════════════════════ */}
        {filteredCategories.map((cat) => (
          <div key={cat.id} ref={(el) => { sectionRefs.current[cat.id] = el; }}>
            {/* section title */}
            <div style={{ padding: "10px 16px 6px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--lawha-ink)", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: 6 }}>
                {cat.name}
                <span style={{ flex: 1, height: 1, background: "var(--lawha-border)", display: "block" }} />
              </div>
            </div>
            {/* items */}
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {cat.menuItems.map((item) => (
                <ItemCard key={item.id} item={item} colorIdx={itemIdx.get(item.id) ?? 0} />
              ))}
            </div>
          </div>
        ))}

        {/* empty state */}
        {filteredCategories.length === 0 && search && (
          <div style={{ padding: "64px 16px", textAlign: "center" }}>
            <Search style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.2, color: "var(--lawha-ink-3)" }} />
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--lawha-ink-2)" }}>No items found</p>
            <p style={{ fontSize: "0.62rem", color: "var(--lawha-ink-3)", marginTop: 4 }}>Try a different search term</p>
          </div>
        )}

        {/* ══ INFO FOOTER ════════════════════════════════════ */}
        <div style={{
          margin: "16px 16px 20px", background: "#fff",
          borderRadius: 16, padding: 14,
          border: "1.5px solid var(--lawha-border)",
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--lawha-ink)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Restaurant Info
          </p>

          {todayHours && (
            <InfoRow icon="🕐" last={!restaurant.phone && !restaurant.instagramUrl && !restaurant.locationText}>
              {todayHours.isClosed ? "Closed today" : `Today: ${todayHours.openTime} – ${todayHours.closeTime}`}
            </InfoRow>
          )}
          {restaurant.phone && (
            <InfoRow icon="📞" href={`tel:${restaurant.phone}`} last={!restaurant.instagramUrl && !restaurant.locationText}>
              {restaurant.phone}
            </InfoRow>
          )}
          {restaurant.instagramUrl && (
            <InfoRow icon="📸" href={restaurant.instagramUrl} external accent last={!restaurant.locationText}>
              Instagram
            </InfoRow>
          )}
          {restaurant.locationText && (
            <InfoRow icon="📍" href={restaurant.googleMapsUrl ?? undefined} external last>
              {restaurant.locationText}
            </InfoRow>
          )}

          <p style={{ textAlign: "center", fontSize: "0.55rem", color: "var(--lawha-ink-3)", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--lawha-border-2)" }}>
            Powered by <span style={{ color: "var(--lawha-brand)", fontWeight: 700 }}>Lawha لوحة</span>
          </p>
        </div>

    </div>
  );
}

/* ─── InfoRow ─────────────────────────────────────── */
function InfoRow({
  icon, href, external, accent, last, children,
}: {
  icon: string;
  href?: string;
  external?: boolean;
  accent?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  const row = (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 0",
      borderBottom: last ? "none" : "1px solid var(--lawha-border-2)",
    }}>
      <div style={{
        width: 26, height: 26, background: "var(--lawha-brand-pale)",
        borderRadius: 8, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "0.7rem", flexShrink: 0,
      }}>{icon}</div>
      <span style={{ fontSize: "0.6rem", fontWeight: 500, color: accent ? "var(--lawha-brand)" : "var(--lawha-ink-2)" }}>{children}</span>
    </div>
  );
  if (href) return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>{row}</a>;
  return row;
}

/* ─── ItemCard ────────────────────────────────────── */
function ItemCard({ item, colorIdx }: { item: MenuItem; colorIdx: number }) {
  const bg = IMG_BG[colorIdx % IMG_BG.length];
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: 12,
      display: "flex", gap: 10, alignItems: "center",
      border: "1.5px solid var(--lawha-border-2)",
      boxShadow: "0 1px 4px rgba(26,18,10,0.06)",
      opacity: item.isAvailable ? 1 : 0.55,
      transition: "box-shadow 0.2s",
    }}>
      {/* image */}
      <div style={{
        width: 68, height: 68, borderRadius: 10, flexShrink: 0,
        background: item.photoUrl ? undefined : bg,
        overflow: "hidden", position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {item.photoUrl
          ? <Image src={item.photoUrl} alt={item.name} width={68} height={68} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: "2rem" }}>🍽️</span>
        }
        {!item.isAvailable && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "0.45rem", fontWeight: 700, color: "var(--lawha-red)", letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 }}>
              SOLD<br />OUT
            </span>
          </div>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* tags */}
        {(item.isFeatured || !item.isAvailable) && (
          <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
            {item.isFeatured && item.isAvailable && <Chip color="gold">⭐ Popular</Chip>}
            {!item.isAvailable && <Chip color="red">✕ Unavailable</Chip>}
          </div>
        )}

        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--lawha-ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </p>
        {item.description && (
          <p style={{ fontSize: "0.58rem", color: "var(--lawha-ink-2)", lineHeight: 1.5, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.description}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: item.description ? 0 : 6 }}>
          <span style={{ fontFamily: "var(--font-dm-mono,monospace)", fontSize: "0.78rem", fontWeight: 500, color: "var(--lawha-ink)" }}>
            {formatPrice(item.priceIqd)}
          </span>
          <button disabled={!item.isAvailable} style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: item.isAvailable ? "var(--lawha-brand)" : "var(--lawha-border)",
            color: item.isAvailable ? "#fff" : "var(--lawha-ink-3)",
            fontSize: "1rem", border: "none",
            cursor: item.isAvailable ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}>+</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Chip ────────────────────────────────────────── */
function Chip({ color, children }: { color: "gold" | "red" | "green" | "blue"; children: React.ReactNode }) {
  const map = {
    gold:  { bg: "var(--lawha-gold-pale)",  fg: "var(--lawha-gold)"  },
    red:   { bg: "var(--lawha-red-pale)",   fg: "var(--lawha-red)"   },
    green: { bg: "var(--lawha-green-pale)", fg: "var(--lawha-green)" },
    blue:  { bg: "#EBF1FD",                 fg: "#2D6BE4"            },
  };
  return (
    <span style={{ fontSize: "0.5rem", fontWeight: 700, padding: "2px 6px", borderRadius: 5, letterSpacing: "0.05em", textTransform: "uppercase", background: map[color].bg, color: map[color].fg }}>
      {children}
    </span>
  );
}
