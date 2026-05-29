import { SEO } from "../components/SEO";
import { PAGE_SEO } from "../data/seoMeta";

function LegalWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl text-white font-light mb-6" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h1>
      <div className="space-y-4 text-[14px] text-white/45 leading-relaxed [&_h2]:text-white/70 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:text-white/55 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_a]:text-white/60 [&_a]:underline">
        <p>XI Eleven XVI Sixteen L.L.C. ("we," "us," or "our") operates the XI · XVI fashion platform.</p>
        <p>EIN: 33-3471366 — Florida, USA</p>
        {children}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PRIVACY POLICY
   ──────────────────────────────────────────────────────────── */
export function PrivacyPage() {
  return (
    <>
      <SEO title={PAGE_SEO.privacy.title} description={PAGE_SEO.privacy.description} url="/privacy" />
      <LegalWrapper title="Privacy Policy">
        <p><em>Last updated: May 25, 2026</em></p>

        <h2>1. Information We Collect</h2>
        <h3>a. Information You Provide</h3>
        <ul>
          <li><strong>Account information:</strong> name, email address, and password when you create an account.</li>
          <li><strong>Order information:</strong> shipping address, billing address, phone number, and payment details when you place an order.</li>
          <li><strong>Communications:</strong> any information you share when you contact us or subscribe to our newsletter.</li>
        </ul>

        <h3>b. Information Collected Automatically</h3>
        <ul>
          <li><strong>Device & browser data:</strong> IP address, browser type, operating system, device identifiers, and screen resolution.</li>
          <li><strong>Usage data:</strong> pages visited, time spent on pages, click patterns, referring URLs, and search queries.</li>
          <li><strong>Cookies & similar technologies:</strong> we use cookies, local storage, and pixel tags to remember preferences, authenticate sessions, and analyze site performance.</li>
        </ul>

        <h3>c. Information from Third Parties</h3>
        <p>We may receive information from payment processors (Stripe), fulfillment partners (Printful), and analytics services to complete transactions and improve our services.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Process and fulfill your orders, including manufacturing, shipping, and delivery notifications.</li>
          <li>Communicate order confirmations, shipping updates, and customer support responses.</li>
          <li>Improve our website, products, and customer experience.</li>
          <li>Send promotional emails and marketing communications (with your consent; you may opt out at any time).</li>
          <li>Detect and prevent fraud, unauthorized access, and other illegal activities.</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>We do not sell your personal information. We share data only with:</p>
        <ul>
          <li><strong>Service providers:</strong> Stripe (payment processing), Printful (order fulfillment and shipping), Convex (database hosting), and Vercel (website hosting) — each bound by contractual data-protection obligations.</li>
          <li><strong>Legal requirements:</strong> when required by law, subpoena, court order, or to protect our rights, property, or safety.</li>
          <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, your data may be transferred to the successor entity.</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>We use the following types of cookies:</p>
        <ul>
          <li><strong>Essential cookies:</strong> required for site functionality, authentication, and cart persistence.</li>
          <li><strong>Analytics cookies:</strong> help us understand traffic patterns and improve the shopping experience.</li>
          <li><strong>Marketing cookies:</strong> used to deliver relevant advertisements across platforms.</li>
        </ul>
        <p>You can manage cookie preferences through your browser settings. Disabling essential cookies may affect site functionality.</p>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures including TLS/SSL encryption for all data in transit, secure payment processing through Stripe (PCI-DSS compliant), and access controls on our systems. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2>6. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. Order records are retained for a minimum of 7 years for tax and legal compliance.</p>

        <h2>7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete your personal information.</li>
          <li>Object to or restrict certain processing activities.</li>
          <li>Request a portable copy of your data.</li>
          <li>Withdraw consent for marketing communications at any time.</li>
          <li>Lodge a complaint with a supervisory authority.</li>
        </ul>
        <p>To exercise any of these rights, email us at <a href="mailto:xixvi1116@icloud.com">xixvi1116@icloud.com</a>.</p>

        <h2>8. California Residents (CCPA)</h2>
        <p>If you are a California resident, you have the right to know what personal information we collect, request deletion of your data, and opt out of the sale of personal information (we do not sell personal data). To submit a request, contact us at the email above. We will verify your identity before processing any request.</p>

        <h2>9. Children's Privacy</h2>
        <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we learn that we have collected data from a child under 13, we will delete it promptly.</p>

        <h2>10. International Transfers</h2>
        <p>Your information may be transferred to and processed in the United States and other countries where our service providers operate. By using our site, you consent to such transfers. We take steps to ensure your data receives an adequate level of protection wherever it is processed.</p>

        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the most recent revision. Continued use of our site after changes constitutes acceptance of the revised policy.</p>

        <h2>12. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact us at:</p>
        <p>
          XI Eleven XVI Sixteen L.L.C.<br />
          Email: <a href="mailto:xixvi1116@icloud.com">xixvi1116@icloud.com</a><br />
          Instagram: <a href="https://instagram.com/xielevenxvisixteen" target="_blank" rel="noopener noreferrer">@xielevenxvisixteen</a>
        </p>
      </LegalWrapper>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   TERMS OF SERVICE
   ──────────────────────────────────────────────────────────── */
export function TermsPage() {
  return (
    <>
      <SEO title={PAGE_SEO.terms.title} description={PAGE_SEO.terms.description} url="/terms" />
      <LegalWrapper title="Terms of Service">
        <p><em>Last updated: May 25, 2026</em></p>

        <p>Please read these Terms of Service ("Terms") carefully before using the XI · XVI website and purchasing our products. By accessing or using our site, you agree to be bound by these Terms.</p>

        <h2>1. Eligibility</h2>
        <p>You must be at least 18 years old (or the age of majority in your jurisdiction) to make purchases on our site. By placing an order, you represent that you meet this requirement.</p>

        <h2>2. Products & Pricing</h2>
        <ul>
          <li>All products are made to order through our print-on-demand manufacturing partners. Product images are representative; slight variations in color may occur due to screen settings and printing processes.</li>
          <li>Prices are listed in US Dollars (USD) and are subject to change without notice. Any applicable taxes will be calculated at checkout based on your shipping address.</li>
          <li>We reserve the right to correct pricing errors. If an error is discovered after your order is placed, we will notify you and offer the option to proceed at the correct price or cancel for a full refund.</li>
        </ul>

        <h2>3. Orders & Payment</h2>
        <ul>
          <li>By placing an order, you make an offer to purchase that we may accept or decline at our discretion.</li>
          <li>Payment is processed securely through Stripe. We accept major credit and debit cards. Your payment information is transmitted directly to Stripe and is never stored on our servers.</li>
          <li>An order confirmation email does not constitute acceptance; acceptance occurs when the item is dispatched for shipping.</li>
          <li>We reserve the right to cancel orders that appear fraudulent, violate these Terms, or cannot be fulfilled.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>All content on this site — including logos, designs, text, graphics, images, trademarks, and software — is the property of XI Eleven XVI Sixteen L.L.C. or its licensors and is protected by U.S. and international intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.</p>

        <h2>5. User Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
          <li>You agree to provide accurate, current, and complete information during registration and to update it as necessary.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these Terms or are used for unauthorized purposes.</li>
        </ul>

        <h2>6. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the site for any unlawful purpose or in violation of any applicable law.</li>
          <li>Attempt to gain unauthorized access to any part of the site or its systems.</li>
          <li>Interfere with or disrupt the site's operation, servers, or networks.</li>
          <li>Scrape, data-mine, or use automated tools to extract content from the site without permission.</li>
          <li>Impersonate any person or entity, or falsely represent your affiliation.</li>
          <li>Upload or transmit viruses, malware, or other harmful code.</li>
        </ul>

        <h2>7. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, XI Eleven XVI Sixteen L.L.C. and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of profits, data, or goodwill — arising from your use of or inability to use the site or products, even if we have been advised of the possibility of such damages.</p>
        <p>Our total liability for any claim arising from these Terms or your use of the site shall not exceed the amount you paid for the specific product(s) giving rise to the claim.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The site and all products are provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the site will be uninterrupted, error-free, or free of harmful components.</p>

        <h2>9. Indemnification</h2>
        <p>You agree to indemnify and hold harmless XI Eleven XVI Sixteen L.L.C. and its affiliates from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from your use of the site, violation of these Terms, or infringement of any third-party rights.</p>

        <h2>10. Governing Law & Disputes</h2>
        <p>These Terms are governed by the laws of the State of Florida, without regard to its conflict of law provisions. Any dispute arising from these Terms or your use of the site shall be resolved exclusively in the state or federal courts located in Florida. You waive any objection to jurisdiction and venue in such courts.</p>

        <h2>11. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.</p>

        <h2>12. Changes to These Terms</h2>
        <p>We reserve the right to modify these Terms at any time. Changes take effect when posted on this page. Your continued use of the site after changes are posted constitutes acceptance of the revised Terms.</p>

        <h2>13. Contact</h2>
        <p>
          XI Eleven XVI Sixteen L.L.C.<br />
          Email: <a href="mailto:xixvi1116@icloud.com">xixvi1116@icloud.com</a><br />
          Instagram: <a href="https://instagram.com/xielevenxvisixteen" target="_blank" rel="noopener noreferrer">@xielevenxvisixteen</a>
        </p>
      </LegalWrapper>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   SHIPPING POLICY
   ──────────────────────────────────────────────────────────── */
export function ShippingPolicyPage() {
  return (
    <>
      <SEO title={PAGE_SEO.shippingPolicy.title} description={PAGE_SEO.shippingPolicy.description} url="/shipping-policy" />
      <LegalWrapper title="Shipping Policy">
        <p><em>Last updated: May 25, 2026</em></p>

        <h2>1. Order Processing</h2>
        <p>All XI · XVI products are made to order. Once your order is placed and payment is confirmed, manufacturing begins within 1–2 business days. Production typically takes 2–5 business days depending on the item and current demand.</p>

        <h2>2. Shipping Methods & Delivery Times</h2>
        <h3>United States (Domestic)</h3>
        <ul>
          <li><strong>Standard Shipping:</strong> 5–8 business days after production (USPS / UPS / FedEx).</li>
          <li><strong>Express Shipping:</strong> 2–4 business days after production (where available at checkout).</li>
        </ul>
        <h3>International</h3>
        <ul>
          <li><strong>Canada:</strong> 8–15 business days after production.</li>
          <li><strong>United Kingdom:</strong> 8–15 business days after production.</li>
          <li><strong>Australia:</strong> 10–20 business days after production.</li>
          <li><strong>Rest of World:</strong> 10–25 business days after production (where available).</li>
        </ul>
        <p>Delivery estimates shown at checkout include both production and transit time. These are estimates, not guarantees — actual delivery may vary due to carrier delays, customs processing, or high-demand periods.</p>

        <h2>3. Shipping Costs</h2>
        <p>Shipping rates are calculated in real time at checkout based on your delivery address, order weight, and selected shipping method. Any applicable duties, import taxes, or customs fees for international orders are the responsibility of the recipient and are not included in the order total.</p>

        <h2>4. Order Tracking</h2>
        <p>Once your order ships, you will receive a confirmation email with a tracking number and link. You can also view your order status by logging into your account. Please allow 24–48 hours after shipment for tracking information to become active in the carrier's system.</p>

        <h2>5. Shipping Address</h2>
        <p>Please ensure your shipping address is complete and accurate at the time of checkout. We are not responsible for orders delivered to incorrect addresses provided by the customer. If a package is returned to us due to an incorrect address, you will be responsible for any additional shipping charges to reship the order.</p>

        <h2>6. Lost or Damaged Packages</h2>
        <p>If your package appears lost or arrives damaged:</p>
        <ol>
          <li>Contact us within 14 days of the estimated delivery date.</li>
          <li>For damaged items, include photos of the packaging and the damaged product.</li>
          <li>We will work with the carrier to investigate and, where appropriate, send a replacement or issue a refund at no additional cost to you.</li>
        </ol>

        <h2>7. P.O. Boxes & APO/FPO</h2>
        <p>We ship to P.O. Boxes and APO/FPO addresses within the United States via USPS. Delivery to these addresses may take longer than standard domestic shipping.</p>

        <h2>8. Contact</h2>
        <p>For shipping questions or concerns, reach out to us at:</p>
        <p>
          Email: <a href="mailto:xixvi1116@icloud.com">xixvi1116@icloud.com</a><br />
          Instagram: <a href="https://instagram.com/xielevenxvisixteen" target="_blank" rel="noopener noreferrer">@xielevenxvisixteen</a>
        </p>
      </LegalWrapper>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   RETURNS & REFUNDS
   ──────────────────────────────────────────────────────────── */
export function ReturnsPage() {
  return (
    <>
      <SEO title={PAGE_SEO.returns.title} description={PAGE_SEO.returns.description} url="/returns" />
      <LegalWrapper title="Returns & Refunds">
        <p><em>Last updated: May 25, 2026</em></p>

        <p>We want you to love every XI · XVI piece you wear. Because all of our products are made to order, our return and refund policy differs from traditional retail. Please review the details below.</p>

        <h2>1. Made-to-Order Policy</h2>
        <p>All XI · XVI products are custom manufactured when you place your order. For this reason, <strong>we do not accept returns or exchanges for change of mind, incorrect sizing, or personal preference.</strong> We strongly recommend reviewing our <a href="/size-guide">Size Guide</a> before purchasing.</p>

        <h2>2. Defective or Damaged Items</h2>
        <p>If you receive an item that is defective, damaged, or materially different from what was ordered, we will make it right. To request a resolution:</p>
        <ol>
          <li>Contact us within <strong>14 days</strong> of receiving your order.</li>
          <li>Provide your order number, a description of the issue, and clear photos showing the defect or damage.</li>
          <li>We will review your claim within 3 business days.</li>
        </ol>
        <p>If approved, we will offer one of the following at our discretion:</p>
        <ul>
          <li><strong>Free replacement:</strong> A new item manufactured and shipped to you at no additional cost.</li>
          <li><strong>Full refund:</strong> A refund to your original payment method.</li>
        </ul>

        <h2>3. Wrong Item Received</h2>
        <p>If you receive an item that is different from what you ordered (wrong size, color, or product), contact us within 14 days. We will ship the correct item at no cost and provide a prepaid return label for the incorrect item.</p>

        <h2>4. Print Quality Issues</h2>
        <p>Our print-on-demand process is subject to minor variations. The following are considered within normal production tolerances and are not eligible for returns or refunds:</p>
        <ul>
          <li>Slight color variations between the product image on screen and the printed product (due to screen calibration and printing processes).</li>
          <li>Minor differences in print placement (within 0.5 inches of the intended position).</li>
        </ul>
        <p>Significant print defects — such as smudging, missing elements, or incorrect artwork — are covered under Section 2.</p>

        <h2>5. Refund Processing</h2>
        <ul>
          <li>Approved refunds are processed within 5–7 business days of approval.</li>
          <li>Refunds are issued to the original payment method (credit/debit card via Stripe).</li>
          <li>Depending on your bank or card issuer, it may take an additional 5–10 business days for the refund to appear on your statement.</li>
          <li>Shipping costs are non-refundable unless the return is due to our error.</li>
        </ul>

        <h2>6. Order Cancellations</h2>
        <p>Because production begins promptly after payment, cancellations are only possible if requested <strong>within 2 hours</strong> of placing your order and before manufacturing has started. To request a cancellation, contact us immediately with your order number. If production has already begun, the order cannot be cancelled.</p>

        <h2>7. Exchanges</h2>
        <p>We do not offer direct exchanges. If you received a defective or incorrect item (Sections 2–3), we will ship a replacement. For all other cases, you may place a new order.</p>

        <h2>8. How to Contact Us</h2>
        <p>For all return and refund inquiries:</p>
        <p>
          Email: <a href="mailto:xixvi1116@icloud.com">xixvi1116@icloud.com</a><br />
          Instagram: <a href="https://instagram.com/xielevenxvisixteen" target="_blank" rel="noopener noreferrer">@xielevenxvisixteen</a>
        </p>
        <p>Please include your order number in all correspondence to help us assist you quickly.</p>
      </LegalWrapper>
    </>
  );
}
