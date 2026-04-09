import type { ReactNode } from 'react';

export const metadata = {
  title: "Privacy Policy | Kindora World",
  description: "How Kindora World collects, uses, and protects your information.",
};

const EFFECTIVE_DATE = "April 9, 2026";
const CONTACT_EMAIL = "tim@timshephard.co";
const COMPANY = "Creative Mind Ventures LLC";
const APP_NAME = "Kindora";
const DOMAIN = "kindora.world";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-sm font-medium text-emerald-600 mb-2 tracking-wide uppercase">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">
            Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; {APP_NAME} by {COMPANY}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-gray-700 leading-relaxed">

        {/* Intro */}
        <section>
          <p>
            {COMPANY} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the {APP_NAME} platform at{" "}
            <a href={`https://${DOMAIN}`} className="text-emerald-600 underline">
              {DOMAIN}
            </a>{" "}
            and its associated mobile application (collectively, the &ldquo;Service&rdquo;). This Privacy Policy
            explains what information we collect, how we use it, and the choices you have.
          </p>
          <p className="mt-4">
            By using the Service, you agree to the collection and use of information as described here.
            If you do not agree, please discontinue use of the Service.
          </p>
        </section>

        <Divider />

        {/* 1. Information We Collect */}
        <section>
          <H2>1. Information We Collect</H2>

          <H3>Information you provide directly</H3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Contact information</strong> &mdash; name and email address when you sign up for
              updates or submit a lead capture form.
            </li>
            <li>
              <strong>Tool inputs</strong> &mdash; information you enter when using our tools, including ZIP
              code, household size, annual income range, health coverage status, number of children,
              medication usage, childcare needs, dietary preferences, and media preferences. This
              information is used solely to generate personalized results within the tool session.
            </li>
          </ul>

          <H3 className="mt-6">Information collected automatically</H3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong>Usage data</strong> &mdash; pages visited, tool interactions, session duration, and
              referring URLs, collected via analytics software (Google Analytics 4).
            </li>
            <li>
              <strong>Device and browser data</strong> &mdash; browser type, operating system, screen
              resolution, and approximate geographic location derived from IP address.
            </li>
            <li>
              <strong>Cookies and local storage</strong> &mdash; small data files stored on your device to
              maintain session state and improve performance. You may disable cookies in your browser
              settings; some features may not function correctly if you do.
            </li>
          </ul>

          <H3 className="mt-6">Information we do NOT collect</H3>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>We do not collect Social Security numbers, financial account numbers, or payment card information.</li>
            <li>We do not collect precise GPS location &mdash; only the ZIP code you enter.</li>
            <li>
              We do not knowingly collect personal information from children under 13. {APP_NAME} is
              designed to be used by parents and guardians on behalf of their families. If we learn we
              have inadvertently collected data from a child under 13 without verified parental
              consent, we will delete it promptly. Contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </li>
          </ul>
        </section>

        <Divider />

        {/* 2. How We Use Information */}
        <section>
          <H2>2. How We Use Your Information</H2>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>To generate personalized results and recommendations within each tool.</li>
            <li>To send you onboarding or update emails if you opted in via our lead capture form.</li>
            <li>To improve the Service by analyzing aggregate usage patterns.</li>
            <li>To detect and prevent abuse, fraud, or violations of our Terms of Service.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="mt-4">
            We do not use your tool inputs (health status, income range, family details) for
            advertising targeting, profiling, or any purpose beyond generating your in-session results.
          </p>
        </section>

        <Divider />

        {/* 3. Third-Party Services */}
        <section>
          <H2>3. Third-Party Services</H2>
          <p className="mb-4">
            The Service integrates with the following third-party providers. Each has its own privacy
            policy governing data they receive:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="text-left p-3 font-semibold text-gray-800 border border-emerald-100">Provider</th>
                  <th className="text-left p-3 font-semibold text-gray-800 border border-emerald-100">Purpose</th>
                  <th className="text-left p-3 font-semibold text-gray-800 border border-emerald-100">Data shared</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Anthropic (Claude API)", "AI-generated recommendations and validation", "Tool inputs \u2014 no name or email"],
                  ["Google Places API", "Nearby childcare providers, grocery stores", "ZIP code and search query"],
                  ["CMS Marketplace API", "Real 2026 health plan data", "ZIP code, household size, income range"],
                  ["Airtable", "Lead capture and validation log storage", "Name, email, tool used, session summary"],
                  ["Brevo (Sendinblue)", "Transactional and onboarding emails", "Name and email address"],
                  ["Google Analytics 4", "Usage analytics", "Anonymized device and usage data"],
                  ["Instacart (pending)", "Grocery cart deep-links", "No personal data \u2014 redirect only"],
                ].map(([provider, purpose, data], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-100 font-medium text-gray-800">{provider}</td>
                    <td className="p-3 border border-gray-100">{purpose}</td>
                    <td className="p-3 border border-gray-100 text-gray-600">{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            We do not sell, rent, or trade your personal information to any third party for their
            marketing purposes.
          </p>
        </section>

        <Divider />

        {/* 4. Data Retention */}
        <section>
          <H2>4. Data Retention</H2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Lead capture data</strong> (name, email) &mdash; retained in Airtable until you
              request deletion.
            </li>
            <li>
              <strong>Tool session inputs</strong> &mdash; processed server-side in real time and not
              stored beyond the session, except in anonymized validation logs when a content safety
              flag is triggered.
            </li>
            <li>
              <strong>Validation logs</strong> &mdash; retained for up to 90 days for quality assurance,
              then deleted. Logs contain no name or email.
            </li>
            <li>
              <strong>Analytics data</strong> &mdash; governed by Google Analytics 4 retention settings
              (default 14 months).
            </li>
          </ul>
        </section>

        <Divider />

        {/* 5. Your Rights */}
        <section>
          <H2>5. Your Rights and Choices</H2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Access the personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your personal information.</li>
            <li>Opt out of marketing emails at any time via the unsubscribe link in any email we send.</li>
            <li>Request that we not sell or share your personal information (we do not sell it).</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">
              {CONTACT_EMAIL}
            </a>
            . We will respond within 30 days.
          </p>
          <p className="mt-3">
            <strong>Texas residents:</strong> Under the Texas Data Privacy and Security Act (TDPSA),
            you have the right to access, correct, delete, and opt out of the sale or sharing of your
            personal data. We do not sell personal data.
          </p>
          <p className="mt-3">
            <strong>California residents:</strong> Under the CCPA/CPRA, you have the right to know,
            delete, and opt out of the sale of personal information. We do not sell personal
            information. To submit a request, contact us at the email above.
          </p>
        </section>

        <Divider />

        {/* 6. Security */}
        <section>
          <H2>6. Security</H2>
          <p>
            We use industry-standard measures to protect your information, including HTTPS encryption
            in transit, environment variable management for API keys, and access-controlled data
            storage. No method of transmission over the internet is 100% secure. We cannot guarantee
            absolute security, but we are committed to protecting your data.
          </p>
        </section>

        <Divider />

        {/* 7. Links to Other Sites */}
        <section>
          <H2>7. Links to External Sites</H2>
          <p>
            Our tools link to external resources such as HealthCare.gov, FindAHealthCenter.hrsa.gov,
            Common Sense Media, GoodRx, MDsave, and grocery retailer websites. We are not responsible
            for the privacy practices of these third-party sites. We encourage you to review their
            privacy policies before providing any personal information.
          </p>
        </section>

        <Divider />

        {/* 8. Changes */}
        <section>
          <H2>8. Changes to This Policy</H2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            effective date at the top of this page. Continued use of the Service after changes are
            posted constitutes acceptance of the revised policy. For material changes, we will provide
            notice via email or a prominent in-app notice.
          </p>
        </section>

        <Divider />

        {/* 9. Contact */}
        <section>
          <H2>9. Contact Us</H2>
          <p>
            If you have questions about this Privacy Policy or our data practices, contact us at:
          </p>
          <div className="mt-4 bg-emerald-50 rounded-xl p-5 text-sm">
            <p className="font-semibold text-gray-900">{COMPANY}</p>
            <p className="text-gray-600">Operating as {APP_NAME} World</p>
            <p className="text-gray-600">Dallas&ndash;Fort Worth, Texas</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>&copy; 2025 {COMPANY}. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="/" className="hover:text-gray-600 transition-colors">Back to {APP_NAME}</a>
          </div>
        </div>
      </div>
    </main>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-gray-900 mb-3">{children}</h2>
  );
}

function H3({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-base font-semibold text-gray-800 mt-5 mb-1 ${className}`}>
      {children}
    </h3>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}
