import type { ReactNode } from 'react';

export const metadata = {
  title: "Terms of Service | Kindora World",
  description: "Terms and conditions for using the Kindora platform.",
};

const EFFECTIVE_DATE = "April 9, 2026";
const CONTACT_EMAIL = "tim@timshephard.co";
const COMPANY = "Creative Mind Ventures LLC";
const APP_NAME = "Kindora";
const DOMAIN = "kindora.world";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50 border-b border-sky-100">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-sm font-medium text-indigo-500 mb-2 tracking-wide uppercase">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-500 text-sm">
            Effective date: {EFFECTIVE_DATE} &nbsp;&middot;&nbsp; {APP_NAME} by {COMPANY}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 text-gray-700 leading-relaxed">

        {/* Intro */}
        <section>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the {APP_NAME} platform
            at{" "}
            <a href={`https://${DOMAIN}`} className="text-indigo-500 underline">
              {DOMAIN}
            </a>{" "}
            and its associated mobile application (collectively, the &ldquo;Service&rdquo;), operated by{" "}
            {COMPANY} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p className="mt-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you do not
            agree, do not use the Service.
          </p>
        </section>

        <Divider />

        {/* 1. Eligibility */}
        <section>
          <H2>1. Eligibility</H2>
          <p>
            You must be at least 18 years old to use the Service. By using the Service, you represent
            that you are 18 or older and have the legal capacity to enter into these Terms. The
            Service is intended to be used by parents, guardians, and adults navigating family-related
            decisions &mdash; not by minors directly.
          </p>
        </section>

        <Divider />

        {/* 2. Description of Service */}
        <section>
          <H2>2. Description of Service</H2>
          <p>
            {APP_NAME} provides four family navigation tools:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>
              <strong>Sprout</strong> &mdash; Helps families find childcare providers and estimate eligibility
              for childcare subsidies (CCDF), tax credits (CTC), and FSA savings.
            </li>
            <li>
              <strong>HealthGuide</strong> &mdash; Helps families understand and compare health insurance
              options, including ACA Marketplace plans, CHIP, COBRA, and alternative coverage models.
            </li>
            <li>
              <strong>BrightWatch</strong> &mdash; Provides AI-generated developmental suitability scores
              for media content intended for children under 5.
            </li>
            <li>
              <strong>Nourish</strong> &mdash; Generates meal plans and helps families locate nearby grocery
              stores with shopping list integration.
            </li>
          </ul>
          <p className="mt-4">
            All tools are designed as educational and informational resources only. See Section 4
            (Disclaimers) for important limitations.
          </p>
        </section>

        <Divider />

        {/* 3. User Responsibilities */}
        <section>
          <H2>3. Your Responsibilities</H2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You are responsible for the accuracy of information you enter into the tools. Results
              are only as accurate as the inputs you provide.
            </li>
            <li>
              You agree not to use the Service for any unlawful purpose or in violation of these Terms.
            </li>
            <li>
              You agree not to attempt to reverse-engineer, scrape, or otherwise extract data from
              the Service in an automated manner without our prior written consent.
            </li>
            <li>
              You agree not to submit false, misleading, or harmful content through the Service.
            </li>
            <li>
              You are responsible for maintaining the security of your device and any account
              credentials used to access the Service.
            </li>
          </ul>
        </section>

        <Divider />

        {/* 4. Disclaimers */}
        <section>
          <H2>4. Important Disclaimers</H2>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 my-4">
            <p className="font-semibold text-amber-800 mb-2">Not Professional Advice</p>
            <p className="text-amber-900 text-sm">
              The {APP_NAME} Service &mdash; including all tool outputs, AI-generated recommendations,
              cost estimates, plan comparisons, subsidy calculations, and nutritional suggestions
              &mdash; is provided for <strong>educational and informational purposes only</strong>. Nothing
              on the Service constitutes medical advice, financial advice, legal advice, insurance
              advice, or dietary advice. You should consult a qualified professional before making
              decisions about health insurance, healthcare, childcare subsidies, diet, or any other
              significant family matter.
            </p>
          </div>

          <H3>Health and Insurance Information</H3>
          <p>
            HealthGuide uses data from the CMS Marketplace API and applies deterministic calculations.
            Plan data, premium amounts, deductibles, and subsidy estimates are provided for
            comparison purposes and may not reflect your actual plan options, final costs, or
            eligibility. Always verify plan details directly at{" "}
            <a
              href="https://healthcare.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 underline"
            >
              HealthCare.gov
            </a>{" "}
            or with a licensed insurance broker before enrolling.
          </p>

          <H3 className="mt-4">Childcare Subsidy Estimates</H3>
          <p>
            Sprout provides estimates of potential childcare subsidy eligibility. Actual eligibility
            and benefit amounts are determined by your state&apos;s Child Care and Development Fund (CCDF)
            agency. Contact your local agency to confirm eligibility.
          </p>

          <H3 className="mt-4">Media Suitability Scores</H3>
          <p>
            BrightWatch scores are AI-generated and reflect general developmental research guidance.
            They are not endorsed by any professional medical or child development organization. Use
            your own judgment and consult your pediatrician for guidance specific to your child.
          </p>

          <H3 className="mt-4">AI-Generated Content</H3>
          <p>
            Some portions of the Service use large language models (including Anthropic&apos;s Claude) to
            generate content. AI-generated output may contain errors, omissions, or outdated
            information. We implement validation checks to reduce inaccuracies, but we cannot
            guarantee the accuracy of AI-generated content.
          </p>
        </section>

        <Divider />

        {/* 5. Intellectual Property */}
        <section>
          <H2>5. Intellectual Property</H2>
          <p>
            All content, branding, code, designs, and materials on the Service are owned by{" "}
            {COMPANY} or licensed to us. &ldquo;{APP_NAME}&rdquo; and &ldquo;{APP_NAME} World&rdquo; are trademarks of{" "}
            {COMPANY}. You may not reproduce, distribute, or create derivative works from our content
            without our prior written consent.
          </p>
          <p className="mt-3">
            You retain ownership of any information you submit through the Service. By submitting
            information, you grant us a limited, non-exclusive license to process that information
            solely to provide the Service to you.
          </p>
        </section>

        <Divider />

        {/* 6. Third-Party Links */}
        <section>
          <H2>6. Third-Party Links and Services</H2>
          <p>
            The Service links to external websites and services including HealthCare.gov, CHIP
            enrollment pages, HRSA health center locators, Common Sense Media, GoodRx, MDsave,
            grocery retailers, and others. We do not control these third-party sites and are not
            responsible for their content, accuracy, availability, or privacy practices. Links do not
            constitute endorsement.
          </p>
        </section>

        <Divider />

        {/* 7. Limitation of Liability */}
        <section>
          <H2>7. Limitation of Liability</H2>
          <p>
            To the maximum extent permitted by applicable law, {COMPANY} and its owners, officers,
            employees, and agents shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising out of or related to your use of &mdash; or
            inability to use &mdash; the Service, even if advised of the possibility of such damages.
          </p>
          <p className="mt-3">
            Our total liability to you for any claim arising out of or relating to these Terms or
            the Service shall not exceed the greater of (a) the amount you paid us in the twelve
            months preceding the claim, or (b) $10.00 USD.
          </p>
          <p className="mt-3">
            Some jurisdictions do not allow the exclusion of certain warranties or limitations of
            liability, so the above limitations may not apply to you.
          </p>
        </section>

        <Divider />

        {/* 8. Warranty Disclaimer */}
        <section>
          <H2>8. Warranty Disclaimer</H2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
            express or implied, including warranties of merchantability, fitness for a particular
            purpose, or non-infringement. We do not warrant that the Service will be uninterrupted,
            error-free, or that defects will be corrected.
          </p>
        </section>

        <Divider />

        {/* 9. Termination */}
        <section>
          <H2>9. Termination</H2>
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time,
            with or without notice, for any reason including violation of these Terms. Upon
            termination, your right to use the Service ceases immediately.
          </p>
        </section>

        <Divider />

        {/* 10. Governing Law */}
        <section>
          <H2>10. Governing Law and Disputes</H2>
          <p>
            These Terms are governed by the laws of the State of Texas, without regard to its
            conflict of law provisions. Any dispute arising out of or relating to these Terms or the
            Service shall be resolved in the state or federal courts located in Dallas County, Texas,
            and you consent to personal jurisdiction in those courts.
          </p>
          <p className="mt-3">
            Before initiating any formal legal proceeding, you agree to contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-500 underline">
              {CONTACT_EMAIL}
            </a>{" "}
            and give us 30 days to attempt to resolve the dispute informally.
          </p>
        </section>

        <Divider />

        {/* 11. Changes */}
        <section>
          <H2>11. Changes to These Terms</H2>
          <p>
            We may update these Terms from time to time. When we do, we will update the effective
            date at the top of this page. If changes are material, we will provide notice via email
            or a prominent in-app notice. Continued use of the Service after changes are posted
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <Divider />

        {/* 12. Contact */}
        <section>
          <H2>12. Contact</H2>
          <p>
            For questions about these Terms, contact us at:
          </p>
          <div className="mt-4 bg-indigo-50 rounded-xl p-5 text-sm">
            <p className="font-semibold text-gray-900">{COMPANY}</p>
            <p className="text-gray-600">Operating as {APP_NAME} World</p>
            <p className="text-gray-600">Dallas&ndash;Fort Worth, Texas</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-500 underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>&copy; 2026 {COMPANY}. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
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
