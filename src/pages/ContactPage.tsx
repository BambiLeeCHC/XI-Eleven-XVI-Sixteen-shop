import { useState } from "react";
import { SEO } from "../components/SEO";

/* ─── CSS Keyframes ──────────────────────────────────────────────── */
const styleId = "contact-page-animations";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes contact-glow {
      0%, 100% { opacity: 0.3; filter: blur(40px); }
      50% { opacity: 0.5; filter: blur(60px); }
    }
    @keyframes contact-shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes contact-float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes contact-sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes contact-success {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");

    // Send via mailto fallback (no backend needed)
    const mailtoBody = `Name: ${form.name}%0AEmail: ${form.email}%0ASubject: ${form.subject || "(none)"}%0A%0A${form.message}`;
    window.open(
      `mailto:xixvi1116@icloud.com?subject=${encodeURIComponent(form.subject || "Contact from XI XVI website")}&body=${mailtoBody}`,
      "_self"
    );

    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <>
      <SEO
        title="Contact Us — XI XVI"
        description="Get in touch with XI Eleven XVI Sixteen. We'd love to hear from you."
        path="/contact"
      />

      <div
        className="min-h-screen relative"
        style={{ background: "linear-gradient(180deg, #0c080e 0%, #140e18 40%, #0c080e 100%)" }}
      >
        {/* Background glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "20%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,141,255,0.12), transparent 70%)",
            animation: "contact-glow 6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "15%",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,158,184,0.08), transparent 70%)",
            animation: "contact-glow 8s ease-in-out infinite 2s",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pt-24 pb-20">
          {/* ── Header ── */}
          <div className="text-center mb-16">
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-4"
              style={{ color: "rgba(200,140,255,0.55)" }}
            >
              GET IN TOUCH
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold tracking-wide mb-4"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #fff 0%, rgba(245,230,220,0.85) 50%, rgba(200,140,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Contact Us
            </h1>
            <div
              className="mx-auto mb-6"
              style={{
                width: "60px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(200,140,255,0.4), transparent)",
              }}
            />
            <p
              className="text-[14px] max-w-lg mx-auto leading-relaxed"
              style={{ color: "rgba(245,230,220,0.45)" }}
            >
              Have a question, collaboration idea, or just want to say hello?
              We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* ── Contact Info Cards ── */}
            <div className="md:col-span-1 flex flex-col gap-5">
              {/* Email Card */}
              <a
                href="mailto:xixvi1116@icloud.com"
                className="block group"
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,140,255,0.2)";
                  e.currentTarget.style.background = "rgba(200,140,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(240,210,190,0.08)";
                  e.currentTarget.style.background = "rgba(255,240,230,0.02)";
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(200,140,255,0.15), rgba(255,158,184,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    ✉
                  </div>
                  <span
                    className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                    style={{ color: "rgba(200,140,255,0.6)" }}
                  >
                    Email
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "rgba(245,230,220,0.7)" }}>
                  xixvi1116@icloud.com
                </p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(245,230,220,0.3)" }}>
                  We typically respond within 24 hours
                </p>
              </a>

              {/* Instagram Card */}
              <a
                href="https://instagram.com/xielevenxvisixteen"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,158,184,0.25)";
                  e.currentTarget.style.background = "rgba(255,158,184,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(240,210,190,0.08)";
                  e.currentTarget.style.background = "rgba(255,240,230,0.02)";
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(255,158,184,0.15), rgba(245,201,122,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    📸
                  </div>
                  <span
                    className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                    style={{ color: "rgba(255,158,184,0.6)" }}
                  >
                    Instagram
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "rgba(245,230,220,0.7)" }}>
                  @xielevenxvisixteen
                </p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(245,230,220,0.3)" }}>
                  Follow for drops, behind the scenes & more
                </p>
              </a>

              {/* Location Card */}
              <div
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(245,201,122,0.15), rgba(200,140,255,0.08))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    ✦
                  </div>
                  <span
                    className="text-[10px] tracking-[0.25em] uppercase font-semibold"
                    style={{ color: "rgba(245,201,122,0.6)" }}
                  >
                    Headquarters
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "rgba(245,230,220,0.7)" }}>
                  XI Eleven XVI Sixteen L.L.C.
                </p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(245,230,220,0.3)" }}>
                  Florida, USA
                </p>
              </div>
            </div>

            {/* ── Contact Form ── */}
            <div className="md:col-span-2">
              <div
                style={{
                  background: "rgba(255,240,230,0.02)",
                  border: "1px solid rgba(240,210,190,0.08)",
                  borderRadius: "20px",
                  padding: "32px",
                }}
              >
                <h2
                  className="text-lg font-semibold mb-1 tracking-wide"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "rgba(245,230,220,0.85)",
                  }}
                >
                  Send a Message
                </h2>
                <p className="text-[12px] mb-8" style={{ color: "rgba(245,230,220,0.3)" }}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                {status === "success" ? (
                  <div
                    className="text-center py-12"
                    style={{ animation: "contact-success 0.4s ease-out" }}
                  >
                    <div
                      className="text-4xl mb-4"
                      style={{ animation: "contact-float 3s ease-in-out infinite" }}
                    >
                      ✦
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "rgba(245,230,220,0.85)",
                      }}
                    >
                      Message Sent
                    </h3>
                    <p className="text-[13px]" style={{ color: "rgba(245,230,220,0.4)" }}>
                      Thank you for reaching out. We'll be in touch soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label
                          className="block text-[10px] tracking-[0.2em] uppercase font-semibold mb-2"
                          style={{ color: "rgba(245,230,220,0.4)" }}
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="Your name"
                          className="w-full text-sm outline-none transition-all"
                          style={{
                            background: "rgba(255,240,230,0.04)",
                            border: "1px solid rgba(240,210,190,0.1)",
                            color: "rgba(245,230,220,0.8)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "rgba(200,140,255,0.3)";
                            e.currentTarget.style.background = "rgba(200,140,255,0.04)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(240,210,190,0.1)";
                            e.currentTarget.style.background = "rgba(255,240,230,0.04)";
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          className="block text-[10px] tracking-[0.2em] uppercase font-semibold mb-2"
                          style={{ color: "rgba(245,230,220,0.4)" }}
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          placeholder="your@email.com"
                          className="w-full text-sm outline-none transition-all"
                          style={{
                            background: "rgba(255,240,230,0.04)",
                            border: "1px solid rgba(240,210,190,0.1)",
                            color: "rgba(245,230,220,0.8)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "rgba(200,140,255,0.3)";
                            e.currentTarget.style.background = "rgba(200,140,255,0.04)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(240,210,190,0.1)";
                            e.currentTarget.style.background = "rgba(255,240,230,0.04)";
                          }}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label
                        className="block text-[10px] tracking-[0.2em] uppercase font-semibold mb-2"
                        style={{ color: "rgba(245,230,220,0.4)" }}
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="w-full text-sm outline-none transition-all"
                        style={{
                          background: "rgba(255,240,230,0.04)",
                          border: "1px solid rgba(240,210,190,0.1)",
                          color: "rgba(245,230,220,0.8)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(200,140,255,0.3)";
                          e.currentTarget.style.background = "rgba(200,140,255,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(240,210,190,0.1)";
                          e.currentTarget.style.background = "rgba(255,240,230,0.04)";
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        className="block text-[10px] tracking-[0.2em] uppercase font-semibold mb-2"
                        style={{ color: "rgba(245,230,220,0.4)" }}
                      >
                        Message *
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        placeholder="Tell us what's on your mind..."
                        rows={5}
                        className="w-full text-sm outline-none transition-all resize-none"
                        style={{
                          background: "rgba(255,240,230,0.04)",
                          border: "1px solid rgba(240,210,190,0.1)",
                          color: "rgba(245,230,220,0.8)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          lineHeight: 1.6,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(200,140,255,0.3)";
                          e.currentTarget.style.background = "rgba(200,140,255,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(240,210,190,0.1)";
                          e.currentTarget.style.background = "rgba(255,240,230,0.04)";
                        }}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "sending" || !form.name || !form.email || !form.message}
                      className="self-start px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase font-bold text-white transition-all"
                      style={{
                        background:
                          status === "sending"
                            ? "rgba(200,140,255,0.3)"
                            : "linear-gradient(135deg, #c48dff, #ff9eb8)",
                        borderRadius: "12px",
                        border: "none",
                        cursor: status === "sending" ? "wait" : "pointer",
                        opacity: !form.name || !form.email || !form.message ? 0.4 : 1,
                      }}
                    >
                      {status === "sending" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
