
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-surface-variant p-4 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-[var(--md-sys-color-on-background)]">Privacy Policy</h1>
            <p className="text-outline text-sm mt-1">Last Updated: May 2024</p>
          </div>
          <Button onClick={onBack} variant="outlined" icon="arrow_back">Back</Button>
        </div>

        {/* Content */}
        <Card className="p-6 md:p-10 space-y-8 bg-[var(--md-sys-color-background)]">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">1. Introduction</h2>
            <p className="text-sm text-[var(--md-sys-color-on-background)] leading-relaxed">
              AnPortafolioIA ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our AI-powered recruitment platform. We process personal data in compliance with the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--md-sys-color-on-background)]">
              <li><strong>Identity Data:</strong> Name, email address, profile picture (Avatar).</li>
              <li><strong>Professional Data:</strong> CV/Resume (PDF/DOCX), LinkedIn archives, employment history, skills.</li>
              <li><strong>Usage Data:</strong> Interaction with AI agents, interview simulation transcripts, technical assessment results.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information (collected via functional logs).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">3. How We Use AI (Gemini Models)</h2>
            <p className="text-sm text-[var(--md-sys-color-on-background)] leading-relaxed">
              Our platform uses Google Gemini Pro models to analyze your profile and simulate interviews.
            </p>
            <div className="bg-surface-variant/50 p-4 rounded-xl text-sm border border-outline-variant/50">
              <p><strong>Transparency Note:</strong> Your professional data is sent to the AI model for processing. We do not use your data to train public AI models. The decision-making process for hiring is always reviewed by a human recruiter; the AI acts solely as a recommendation engine.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">4. Data Security (Client-Side Encryption)</h2>
            <p className="text-sm text-[var(--md-sys-color-on-background)] leading-relaxed">
              We employ <strong>AES-GCM Client-Side Encryption</strong> for your sensitive workspace data. This means your CVs and detailed analysis are encrypted in your browser before being stored in our database (Firestore). We cannot access the raw content of your private workspace documents without your user key.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">5. Your Rights (GDPR)</h2>
            <p className="text-sm text-[var(--md-sys-color-on-background)] mb-2">You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--md-sys-color-on-background)]">
              <li><strong>Right to Access & Portability:</strong> You can download a JSON copy of all your data from the Settings menu.</li>
              <li><strong>Right to Rectification:</strong> You can edit your profile information at any time.</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can delete your workspace and account instantly from the Settings menu.</li>
              <li><strong>Right to Withdraw Consent:</strong> You can modify your cookie and processing preferences via the "Privacy Settings" link in the footer.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-primary">6. Contact Us</h2>
            <p className="text-sm text-[var(--md-sys-color-on-background)]">
              If you have questions about this policy or wish to exercise your rights, please contact our Data Protection Officer (DPO) at: privacy@anportafolioia.com.
            </p>
          </section>

        </Card>
      </div>
    </div>
  );
};
