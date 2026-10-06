import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-serif text-xl text-gold-400 mb-3 pb-2 border-b border-gold-600/20">{title}</h2>
    <div className="text-gray-400 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-cosmic-950 pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-xs text-gold-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-serif text-4xl text-gold-400 mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: October 2026 · Effective immediately</p>
        </div>

        <div className="card-cosmic p-8 md:p-10 border border-gold-600/15">

          <p className="text-gray-300 text-sm leading-relaxed mb-8">
            AstroVyoma ("we", "us", or "our") operates the website{' '}
            <a href="https://astrovyoma.com" className="text-gold-400 hover:underline">astrovyoma.com</a>.
            This Privacy Policy explains how we collect, use, and protect your personal information
            when you use our platform.
          </p>

          <Section title="1. Information We Collect">
            <p><strong className="text-gray-300">Account information:</strong> When you register, we collect your name, email address, mobile number, and password (stored as a hash — never in plain text).</p>
            <p><strong className="text-gray-300">Birth details for Kundali:</strong> Date of birth, time of birth, and place of birth. This information is used solely to generate your astrological charts and reports.</p>
            <p><strong className="text-gray-300">Consultation data:</strong> Records of consultations, appointments, and chat sessions with astrologers on our platform.</p>
            <p><strong className="text-gray-300">Payment information:</strong> We do not store card numbers or banking details. Payments are processed securely through third-party payment gateways.</p>
            <p><strong className="text-gray-300">Usage data:</strong> Pages visited, features used, device type, browser, and approximate location (country/city level) for analytics purposes.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>• To provide and personalise your Kundali, horoscope, and astrological reports</p>
            <p>• To connect you with verified Vedic astrologers for consultations</p>
            <p>• To process payments and manage your wallet balance</p>
            <p>• To send transactional emails (OTP verification, booking confirmations, receipts)</p>
            <p>• To respond to support queries and improve our services</p>
            <p>• To send occasional platform updates (you may unsubscribe at any time)</p>
          </Section>

          <Section title="3. How We Share Your Information">
            <p>We do <strong className="text-gray-300">not</strong> sell, rent, or trade your personal data to third parties.</p>
            <p>We share data only in the following limited circumstances:</p>
            <p>• <strong className="text-gray-300">Astrologers on our platform:</strong> When you book a consultation, the astrologer sees your name and the details you share during the session.</p>
            <p>• <strong className="text-gray-300">Service providers:</strong> We use Resend (email delivery) and Railway (cloud hosting). These providers process data on our behalf under strict confidentiality agreements.</p>
            <p>• <strong className="text-gray-300">Legal requirements:</strong> We may disclose information if required by law or to protect the rights and safety of our users.</p>
          </Section>

          <Section title="4. Data Retention">
            <p>We retain your account data for as long as your account is active. Kundali and birth details are retained so you can access your reports at any time. You may request deletion of your account and associated data by contacting us.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use essential cookies to keep you logged in and remember your preferences. We do not use advertising cookies or third-party tracking cookies. You can disable cookies in your browser settings, but some features may not work correctly.</p>
          </Section>

          <Section title="6. Security">
            <p>We use industry-standard security measures including HTTPS encryption, hashed passwords, and JWT-based authentication tokens. While we take every precaution, no method of transmission over the Internet is 100% secure.</p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>AstroVyoma is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to:</p>
            <p>• Access the personal data we hold about you</p>
            <p>• Correct inaccurate information</p>
            <p>• Request deletion of your account and data</p>
            <p>• Opt out of non-transactional communications</p>
            <p>To exercise any of these rights, email us at <a href="mailto:support@astrovyoma.com" className="text-gold-400 hover:underline">support@astrovyoma.com</a>.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email. Continued use of the platform after changes constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <p className="mt-2">
              <strong className="text-gray-300">AstroVyoma</strong><br />
              Email: <a href="mailto:support@astrovyoma.com" className="text-gold-400 hover:underline">support@astrovyoma.com</a><br />
              Website: <a href="https://astrovyoma.com" className="text-gold-400 hover:underline">astrovyoma.com</a>
            </p>
          </Section>

        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-gold-600 hover:text-gold-400 text-sm transition-colors">← Back to AstroVyoma</Link>
        </div>

      </div>
    </div>
  );
}
