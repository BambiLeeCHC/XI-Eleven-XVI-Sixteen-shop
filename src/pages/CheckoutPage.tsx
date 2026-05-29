import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useSessionId } from "../hooks/useSessionId";
import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface ShippingAddress {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  phone: string;
}

interface ShippingRate {
  id: string;
  name: string;
  rate: string;
  rateInCents: number;
  currency: string;
  transitMinDays: number | null;
  transitMaxDays: number | null;
  fulfillmentMinDays: number;
  fulfillmentMaxDays: number;
  totalMinDays: number | null;
  totalMaxDays: number | null;
}

interface TaxInfo {
  rate: number;
  ratePercent: string;
  taxCents: number;
  label: string;
  region: string;
}

/* ─── Country/Region data ────────────────────────────────────────────── */

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "PT", name: "Portugal" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "GR", name: "Greece" },
  { code: "HR", name: "Croatia" },
  { code: "BG", name: "Bulgaria" },
  { code: "IS", name: "Iceland" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "CY", name: "Cyprus" },
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

const CA_PROVINCES = [
  "AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT",
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getDeliveryEstimate(rate: ShippingRate): string {
  if (rate.totalMinDays !== null && rate.totalMaxDays !== null) {
    return `${rate.totalMinDays}–${rate.totalMaxDays} business days`;
  }
  if (rate.transitMinDays !== null && rate.transitMaxDays !== null) {
    return `${rate.transitMinDays}–${rate.transitMaxDays} days transit + production`;
  }
  return "Estimated 7–12 business days";
}

function getDeliveryDateRange(rate: ShippingRate): string {
  const now = new Date();
  const addBusinessDays = (date: Date, days: number) => {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const dow = result.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return result;
  };

  const minDays = rate.totalMinDays ?? 7;
  const maxDays = rate.totalMaxDays ?? 12;
  const earliest = addBusinessDays(now, minDays);
  const latest = addBusinessDays(now, maxDays);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(earliest)} – ${fmt(latest)}`;
}

/* ─── Shared styles ──────────────────────────────────────────────────── */

const glassCard: React.CSSProperties = {
  background: "rgba(255,240,230,0.03)",
  border: "1px solid rgba(240,210,190,0.08)",
  borderRadius: "14px",
  backdropFilter: "blur(8px)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,240,230,0.04)",
  border: "1px solid rgba(240,210,190,0.12)",
  borderRadius: "10px",
  color: "rgba(245,230,220,0.85)",
  fontSize: "13px",
  padding: "12px 14px",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(245,230,220,0.45)",
  fontSize: "10px",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  fontWeight: 600,
  marginBottom: "6px",
  display: "block",
};

/* ─── Main Component ─────────────────────────────────────────────────── */

export function CheckoutPage() {
  const sessionId = useSessionId();
  const cartItems = useQuery(api.cart.getItems, { sessionId }) ?? [];
  const estimateShipping = useAction(api.checkout.estimateShipping);
  const createCheckoutSession = useAction(api.checkout.createCheckoutSession);
  const navigate = useNavigate();

  // Steps: 1 = address, 2 = shipping, 3 = review
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Address state
  const [address, setAddress] = useState<ShippingAddress>({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    stateCode: "",
    countryCode: "US",
    zip: "",
    phone: "",
  });

  // Shipping state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Tax state
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);

  // Totals
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum: number, item: any) => sum + item.product.price * item.quantity,
        0
      ),
    [cartItems]
  );

  // Tax query — runs whenever address country/state + subtotal change
  const taxResult = useQuery(api.tax.calculateTax, {
    countryCode: address.countryCode,
    stateCode: address.stateCode || undefined,
    subtotalCents: subtotal,
  });

  // Keep taxInfo in sync
  useEffect(() => {
    if (taxResult) {
      setTaxInfo(taxResult as TaxInfo);
    }
  }, [taxResult]);

  const taxAmount = taxInfo?.taxCents ?? 0;
  const shippingCost = selectedRate?.rateInCents ?? 0;
  const total = subtotal + taxAmount + shippingCost;

  /* ─── Address Validation ───────────────────────────────────────────── */

  const validateAddress = useCallback((): string | null => {
    if (!address.email || !address.email.includes("@"))
      return "Valid email is required";
    if (!address.firstName.trim()) return "First name is required";
    if (!address.lastName.trim()) return "Last name is required";
    if (!address.address1.trim()) return "Street address is required";
    if (!address.city.trim()) return "City is required";
    if (address.countryCode === "US" || address.countryCode === "CA") {
      if (!address.stateCode.trim()) return "State/province is required";
    }
    if (!address.zip.trim()) return "ZIP/postal code is required";
    if (!address.countryCode) return "Country is required";
    return null;
  }, [address]);

  /* ─── Step 1 → Step 2: Fetch shipping rates ───────────────────────── */

  const handleGetShippingRates = useCallback(async () => {
    const validationErr = validateAddress();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const items = cartItems.map((item: any) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));

      const result = await estimateShipping({
        address: {
          address1: address.address1,
          city: address.city,
          stateCode: address.stateCode || "-",
          countryCode: address.countryCode,
          zip: address.zip,
        },
        items,
      });

      if (result?.success && result.rates?.length > 0) {
        setShippingRates(result.rates);
        setSelectedRate(result.rates[0]); // Pre-select cheapest
        setStep(2);
      } else {
        setError(
          result?.error ||
            "Unable to calculate shipping for this address. Please check your details."
        );
      }
    } catch (err: any) {
      setError(err?.message || "Failed to get shipping rates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [address, cartItems, estimateShipping, validateAddress]);

  /* ─── Step 3 → Stripe checkout ─────────────────────────────────────── */

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedRate) return;
    setError("");
    setLoading(true);

    try {
      const items = cartItems.map((item: any) => ({
        productName: `${item.product.name} — ${item.size}`,
        priceInCents: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.images?.[0] || undefined,
      }));

      const baseUrl = window.location.origin;
      const result = await createCheckoutSession({
        items,
        shippingRateInCents: selectedRate.rateInCents,
        shippingMethodName: `Shipping — ${selectedRate.name}`,
        taxAmountCents: taxAmount > 0 ? taxAmount : undefined,
        taxLabel: taxInfo?.label || undefined,
        customerEmail: address.email,
        successUrl: `${baseUrl}/orders`,
        cancelUrl: `${baseUrl}/checkout`,
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError(result?.error || "Unable to create checkout. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cartItems, selectedRate, address, createCheckoutSession, taxAmount, taxInfo]);

  /* ─── Redirect if cart empty ───────────────────────────────────────── */

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2
          className="text-2xl text-white font-light mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your cart is empty
        </h2>
        <p
          className="text-[13px] mb-6"
          style={{ color: "rgba(245,230,220,0.38)" }}
        >
          Add some pieces before checking out.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-all glass-shimmer"
          style={{
            background:
              "linear-gradient(135deg, rgba(200,140,255,0.12), rgba(255,190,170,0.08))",
            border: "1px solid rgba(240,210,190,0.12)",
            borderRadius: "12px",
          }}
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  /* ─── State/Province selector ──────────────────────────────────────── */

  const stateOptions =
    address.countryCode === "US"
      ? US_STATES
      : address.countryCode === "CA"
        ? CA_PROVINCES
        : [];

  /* ─── State/province label ─────────────────────────────────────────── */

  const stateLabel =
    address.countryCode === "US"
      ? "State"
      : address.countryCode === "CA"
        ? "Province"
        : address.countryCode === "GB"
          ? "County"
          : address.countryCode === "JP"
            ? "Prefecture"
            : "Region";

  /* ─── Update helper ────────────────────────────────────────────────── */

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  /* ─── Render ───────────────────────────────────────────────────────── */

  return (
    <>
    <SEO title={PAGE_SEO.checkout.title} description={PAGE_SEO.checkout.description} url="/checkout" noindex />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/cart"))}
          className="flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase transition-colors"
          style={{ color: "rgba(245,230,220,0.4)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {step === 1 ? "Cart" : "Back"}
        </button>
        <div className="flex-1" />
        <h1
          className="text-2xl sm:text-3xl text-white font-light"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Checkout
        </h1>
        <div className="flex-1" />
        <div style={{ width: 60 }} />
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {[
          { num: 1, label: "Shipping" },
          { num: 2, label: "Delivery" },
          { num: 3, label: "Review" },
        ].map(({ num, label }, i) => (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={{
                  background:
                    step >= num
                      ? "linear-gradient(135deg, #c48dff, #ff9eb8)"
                      : "rgba(255,240,230,0.06)",
                  color:
                    step >= num ? "white" : "rgba(245,230,220,0.3)",
                  border:
                    step >= num
                      ? "none"
                      : "1px solid rgba(240,210,190,0.1)",
                }}
              >
                {step > num ? "✓" : num}
              </div>
              <span
                className="text-[9px] tracking-[0.15em] uppercase mt-2 font-semibold"
                style={{
                  color:
                    step >= num
                      ? "rgba(245,230,220,0.65)"
                      : "rgba(245,230,220,0.25)",
                }}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className="w-12 sm:w-20 h-px mx-2 sm:mx-3 mt-[-18px]"
                style={{
                  background:
                    step > num
                      ? "linear-gradient(90deg, #c48dff, #ff9eb8)"
                      : "rgba(240,210,190,0.08)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left Column — Form Area */}
        <div>
          {/* ─── STEP 1: Address Form ──────────────────────────────── */}
          {step === 1 && (
            <div className="p-5 sm:p-7" style={glassCard}>
              <h2
                className="text-[11px] tracking-[0.2em] uppercase font-bold mb-6"
                style={{ color: "rgba(245,230,220,0.55)" }}
              >
                Shipping Information
              </h2>

              {/* Email */}
              <div className="mb-5">
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={address.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    placeholder="First"
                    value={address.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Last"
                    value={address.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Country */}
              <div className="mb-5">
                <label style={labelStyle}>Country</label>
                <select
                  value={address.countryCode}
                  onChange={(e) => {
                    updateField("countryCode", e.target.value);
                    updateField("stateCode", ""); // Reset state on country change
                  }}
                  style={inputStyle}
                >
                  {COUNTRIES.map((c) => (
                    <option
                      key={c.code}
                      value={c.code}
                      style={{ background: "#1a1520", color: "#ddd" }}
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={address.address1}
                  onChange={(e) => updateField("address1", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Apt, suite, etc. (optional)"
                  value={address.address2}
                  onChange={(e) => updateField("address2", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* City / State / Zip */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div>
                  <label style={labelStyle}>City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>{stateLabel}</label>
                  {stateOptions.length > 0 ? (
                    <select
                      value={address.stateCode}
                      onChange={(e) =>
                        updateField("stateCode", e.target.value)
                      }
                      style={inputStyle}
                    >
                      <option
                        value=""
                        style={{ background: "#1a1520", color: "#888" }}
                      >
                        Select
                      </option>
                      {stateOptions.map((s) => (
                        <option
                          key={s}
                          value={s}
                          style={{ background: "#1a1520", color: "#ddd" }}
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={stateLabel}
                      value={address.stateCode}
                      onChange={(e) =>
                        updateField("stateCode", e.target.value)
                      }
                      style={inputStyle}
                    />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    {address.countryCode === "US" ? "ZIP" : "Postal Code"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      address.countryCode === "US" ? "ZIP" : "Postal"
                    }
                    value={address.zip}
                    onChange={(e) => updateField("zip", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label style={labelStyle}>Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={address.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Tax preview */}
              {taxInfo && taxInfo.taxCents > 0 && (
                <div
                  className="flex items-start gap-2 p-3 mb-4"
                  style={{
                    background: "rgba(200,169,110,0.06)",
                    border: "1px solid rgba(200,169,110,0.12)",
                    borderRadius: "10px",
                  }}
                >
                  <span className="text-[13px] mt-0.5">🏛️</span>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: "rgba(245,230,220,0.5)" }}
                  >
                    {taxInfo.label}: {taxInfo.ratePercent}% (${(taxInfo.taxCents / 100).toFixed(2)})
                    will be added at checkout
                  </p>
                </div>
              )}

              {/* Error */}
              {error && <ErrorBanner message={error} />}

              {/* Continue */}
              <ActionButton
                onClick={handleGetShippingRates}
                loading={loading}
                loadingText="Calculating shipping…"
              >
                CONTINUE TO SHIPPING
              </ActionButton>
            </div>
          )}

          {/* ─── STEP 2: Shipping Method ───────────────────────────── */}
          {step === 2 && (
            <div className="p-5 sm:p-7" style={glassCard}>
              <h2
                className="text-[11px] tracking-[0.2em] uppercase font-bold mb-2"
                style={{ color: "rgba(245,230,220,0.55)" }}
              >
                Choose Shipping Method
              </h2>
              <p
                className="text-[11px] mb-6"
                style={{ color: "rgba(245,230,220,0.3)" }}
              >
                Shipping to {address.firstName} {address.lastName},{" "}
                {address.city}, {address.stateCode} {address.zip},{" "}
                {COUNTRIES.find(c => c.code === address.countryCode)?.name || address.countryCode}
              </p>

              <div className="space-y-3 mb-6">
                {shippingRates.map((rate) => {
                  const isSelected = selectedRate?.id === rate.id;
                  return (
                    <button
                      type="button"
                      key={rate.id}
                      onClick={() => setSelectedRate(rate)}
                      className="w-full text-left p-4 transition-all"
                      style={{
                        background: isSelected
                          ? "rgba(196,141,255,0.08)"
                          : "rgba(255,240,230,0.02)",
                        border: isSelected
                          ? "1.5px solid rgba(196,141,255,0.35)"
                          : "1px solid rgba(240,210,190,0.08)",
                        borderRadius: "12px",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Radio circle */}
                          <div
                            className="w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0"
                            style={{
                              border: isSelected
                                ? "2px solid #c48dff"
                                : "2px solid rgba(240,210,190,0.15)",
                            }}
                          >
                            {isSelected && (
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #c48dff, #ff9eb8)",
                                }}
                              />
                            )}
                          </div>
                          <div>
                            <p
                              className="text-[13px] font-medium"
                              style={{
                                color: isSelected
                                  ? "rgba(245,230,220,0.9)"
                                  : "rgba(245,230,220,0.65)",
                              }}
                            >
                              {rate.name}
                            </p>
                            <p
                              className="text-[11px] mt-1"
                              style={{
                                color: "rgba(245,230,220,0.35)",
                              }}
                            >
                              Est. delivery: {getDeliveryEstimate(rate)}
                            </p>
                            <p
                              className="text-[10px] mt-0.5"
                              style={{
                                color: "rgba(200,160,220,0.5)",
                              }}
                            >
                              Arrives {getDeliveryDateRange(rate)}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-[13px] font-semibold shrink-0"
                          style={{
                            color: isSelected
                              ? "rgba(245,230,220,0.9)"
                              : "rgba(245,230,220,0.55)",
                          }}
                        >
                          ${parseFloat(rate.rate).toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Fulfillment note */}
              <div
                className="flex items-start gap-2 p-3 mb-6"
                style={{
                  background: "rgba(196,141,255,0.04)",
                  border: "1px solid rgba(196,141,255,0.1)",
                  borderRadius: "10px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 mt-0.5"
                  style={{ color: "rgba(196,141,255,0.6)" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "rgba(245,230,220,0.4)" }}
                >
                  Each piece is made-to-order. Production takes 2–5 business
                  days before shipping. Delivery estimates above include both
                  production and transit time.
                  {address.countryCode !== "US" && (
                    <> International orders may be subject to local customs duties upon delivery.</>
                  )}
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <ActionButton
                onClick={() => setStep(3)}
                loading={false}
                disabled={!selectedRate}
              >
                REVIEW ORDER
              </ActionButton>
            </div>
          )}

          {/* ─── STEP 3: Order Review ──────────────────────────────── */}
          {step === 3 && (
            <div className="p-5 sm:p-7" style={glassCard}>
              <h2
                className="text-[11px] tracking-[0.2em] uppercase font-bold mb-6"
                style={{ color: "rgba(245,230,220,0.55)" }}
              >
                Review Your Order
              </h2>

              {/* Shipping address summary */}
              <div
                className="p-4 mb-5"
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.06)",
                  borderRadius: "10px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase font-semibold"
                    style={{ color: "rgba(245,230,220,0.4)" }}
                  >
                    Ship to
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(196,141,255,0.65)" }}
                  >
                    Edit
                  </button>
                </div>
                <p
                  className="text-[13px]"
                  style={{ color: "rgba(245,230,220,0.75)" }}
                >
                  {address.firstName} {address.lastName}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "rgba(245,230,220,0.45)" }}
                >
                  {address.address1}
                  {address.address2 ? `, ${address.address2}` : ""}
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "rgba(245,230,220,0.45)" }}
                >
                  {address.city}, {address.stateCode} {address.zip},{" "}
                  {COUNTRIES.find(c => c.code === address.countryCode)?.name || address.countryCode}
                </p>
                {address.email && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "rgba(245,230,220,0.3)" }}
                  >
                    {address.email}
                  </p>
                )}
              </div>

              {/* Shipping method summary */}
              {selectedRate && (
                <div
                  className="p-4 mb-5"
                  style={{
                    background: "rgba(255,240,230,0.02)",
                    border: "1px solid rgba(240,210,190,0.06)",
                    borderRadius: "10px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] tracking-[0.15em] uppercase font-semibold"
                      style={{ color: "rgba(245,230,220,0.4)" }}
                    >
                      Shipping Method
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[10px] tracking-[0.1em] uppercase"
                      style={{ color: "rgba(196,141,255,0.65)" }}
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className="text-[13px]"
                    style={{ color: "rgba(245,230,220,0.75)" }}
                  >
                    {selectedRate.name}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(200,160,220,0.5)" }}
                  >
                    Est. arrival: {getDeliveryDateRange(selectedRate)}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item: any) => (
                  <div key={item._id} className="flex gap-3">
                    <div
                      className="w-14 h-16 overflow-hidden shrink-0"
                      style={{
                        background: "rgba(255,240,230,0.03)",
                        border: "1px solid rgba(240,210,190,0.06)",
                        borderRadius: "8px",
                      }}
                    >
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: "7px" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            style={{ color: "rgba(245,230,220,0.1)" }}
                          >
                            ✦
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] font-medium truncate"
                        style={{ color: "rgba(245,230,220,0.7)" }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "rgba(245,230,220,0.35)" }}
                      >
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span
                      className="text-[12px] shrink-0"
                      style={{ color: "rgba(245,230,220,0.6)" }}
                    >
                      $
                      {(
                        (item.product.price * item.quantity) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {error && <ErrorBanner message={error} />}

              <ActionButton
                onClick={handlePlaceOrder}
                loading={loading}
                loadingText="Creating checkout…"
              >
                PLACE ORDER — ${(total / 100).toFixed(2)}
              </ActionButton>

              <p
                className="text-center text-[10px] mt-3"
                style={{ color: "rgba(245,230,220,0.18)" }}
              >
                You'll be redirected to Stripe for secure payment
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Order Summary (sticky) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="p-5" style={glassCard}>
            <h3
              className="text-[11px] tracking-[0.2em] uppercase font-bold mb-5"
              style={{ color: "rgba(245,230,220,0.55)" }}
            >
              Order Summary
            </h3>

            {/* Items list */}
            <div
              className="space-y-3 mb-5 pb-5"
              style={{ borderBottom: "1px solid rgba(240,210,190,0.06)" }}
            >
              {cartItems.map((item: any) => (
                <div key={item._id} className="flex gap-3">
                  <div
                    className="relative w-12 h-14 overflow-hidden shrink-0"
                    style={{
                      background: "rgba(255,240,230,0.03)",
                      border: "1px solid rgba(240,210,190,0.06)",
                      borderRadius: "8px",
                    }}
                  >
                    {item.product.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "7px" }}
                      />
                    )}
                    {item.quantity > 1 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold"
                        style={{
                          background:
                            "linear-gradient(135deg, #c48dff, #ff9eb8)",
                          color: "white",
                        }}
                      >
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-medium truncate"
                      style={{ color: "rgba(245,230,220,0.6)" }}
                    >
                      {item.product.name}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "rgba(245,230,220,0.3)" }}
                    >
                      {item.size}
                    </p>
                  </div>
                  <span
                    className="text-[11px] shrink-0"
                    style={{ color: "rgba(245,230,220,0.5)" }}
                  >
                    $
                    {((item.product.price * item.quantity) / 100).toFixed(
                      2
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(245,230,220,0.4)" }}
                >
                  Subtotal
                </span>
                <span
                  className="text-[12px]"
                  style={{ color: "rgba(245,230,220,0.65)" }}
                >
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>

              {/* Tax line */}
              <div className="flex justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(245,230,220,0.4)" }}
                >
                  {taxInfo && taxInfo.taxCents > 0
                    ? `Tax (${taxInfo.ratePercent}%)`
                    : "Tax"}
                </span>
                <span
                  className="text-[12px]"
                  style={{
                    color: taxAmount > 0
                      ? "rgba(245,230,220,0.65)"
                      : "rgba(200,160,220,0.45)",
                  }}
                >
                  {taxAmount > 0
                    ? `$${(taxAmount / 100).toFixed(2)}`
                    : taxInfo?.rate === 0
                      ? "$0.00"
                      : "Calculated at checkout"}
                </span>
              </div>

              <div className="flex justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(245,230,220,0.4)" }}
                >
                  Shipping
                </span>
                <span
                  className="text-[12px]"
                  style={{
                    color: selectedRate
                      ? "rgba(245,230,220,0.65)"
                      : "rgba(200,160,220,0.45)",
                  }}
                >
                  {selectedRate
                    ? `$${(shippingCost / 100).toFixed(2)}`
                    : "Calculated at next step"}
                </span>
              </div>
            </div>

            <div
              className="flex justify-between items-center mt-4 pt-4"
              style={{
                borderTop: "1px solid rgba(240,210,190,0.08)",
              }}
            >
              <span
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: "rgba(245,230,220,0.6)" }}
              >
                Total
              </span>
              <span className="text-lg text-white font-medium">
                ${(total / 100).toFixed(2)}
              </span>
            </div>

            {/* Delivery estimate badge */}
            {selectedRate && (
              <div
                className="mt-4 p-3 text-center"
                style={{
                  background: "rgba(196,141,255,0.04)",
                  border: "1px solid rgba(196,141,255,0.08)",
                  borderRadius: "10px",
                }}
              >
                <p
                  className="text-[10px] tracking-[0.1em] uppercase font-semibold"
                  style={{ color: "rgba(196,141,255,0.55)" }}
                >
                  Estimated Delivery
                </p>
                <p
                  className="text-[13px] mt-1 font-medium"
                  style={{ color: "rgba(245,230,220,0.75)" }}
                >
                  {getDeliveryDateRange(selectedRate)}
                </p>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {[
              { icon: "🔒", text: "Secure" },
              { icon: "🌍", text: "Ships worldwide" },
              { icon: "✦", text: "Premium" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1">
                <span className="text-[11px]">{icon}</span>
                <span
                  className="text-[9px] tracking-[0.1em] uppercase"
                  style={{ color: "rgba(245,230,220,0.2)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

/* ─── Reusable Sub-Components ────────────────────────────────────────── */

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-4 p-3 text-[11px] text-center"
      style={{
        background: "rgba(255,80,80,0.08)",
        border: "1px solid rgba(255,80,80,0.15)",
        borderRadius: "10px",
        color: "rgba(255,140,140,0.85)",
      }}
    >
      {message}
    </div>
  );
}

function ActionButton({
  onClick,
  loading,
  loadingText,
  disabled,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  loadingText?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full py-4 text-[11px] tracking-[0.25em] uppercase font-bold text-white transition-all duration-300 glass-shimmer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background:
          "linear-gradient(135deg, #c48dff 0%, #ff9eb8 50%, #f5c97a 100%)",
        backgroundSize: "200% 100%",
        animation: "gradient-loop 6s ease-in-out infinite",
        borderRadius: "12px",
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="32"
              strokeLinecap="round"
            />
          </svg>
          {loadingText || "PROCESSING…"}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
