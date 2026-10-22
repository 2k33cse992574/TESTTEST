import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { HelpCircle, ExternalLink, MessageSquare, Phone } from 'lucide-react';

const faqs = [
  { q: 'What is the Trust Level and how is it calculated?', a: 'Trust Levels (L0–L4) are computed from evidence stored in the system — format checks, APAAR verification, seat and lock results, and officer certification. They cannot be hand-edited.' },
  { q: 'How do I correct an error in my enrolment record?', a: 'Raise a Correction Request from the Requests page. Your institution or an AICTE officer will review it. All changes are audited.' },
  { q: 'My category certificate is showing as pending — what should I do?', a: 'Your institution needs to verify the uploaded certificate. If it has been more than 10 working days, contact your institution\'s admin office.' },
  { q: 'Can I share my credential with an employer?', a: 'Yes. From the Overview page, generate a Wallet QR. The employer scans their request QR, you approve the consent request, and they receive only the fields you consented to share.' },
  { q: 'What does CONFLICT_HOLD mean on my record?', a: 'It means the system detected an active full-time enrolment at another institution for the same identity. An AICTE officer is mediating. You do not need to take action unless you receive a request.' },
];

export default function StudentHelp() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Help & Support"
        subtitle="Answers to common questions about your APAAR Pramaan student portal."
        breadcrumb={['Student Portal', 'Help']}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-brand-soft rounded-card flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-brand" />
          </div>
          <h2 className="text-sm font-semibold text-text-primary">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              className="group border border-border rounded-card overflow-hidden"
            >
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-text-primary hover:bg-canvas transition-colors list-none">
                {faq.q}
                <span className="text-text-muted ml-2 flex-shrink-0">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-text-secondary border-t border-border bg-canvas">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: MessageSquare, label: 'Contact Institution', sub: 'For record corrections and document issues', color: 'text-brand bg-brand-soft' },
          { icon: Phone,         label: 'AICTE Helpdesk',     sub: '1800-XXX-XXXX · Mon–Fri 9am–6pm',          color: 'text-emerald-600 bg-emerald-50' },
          { icon: ExternalLink,  label: 'APAAR Portal',       sub: 'apaar.education.gov.in',                   color: 'text-blue-600 bg-blue-50' },
        ].map(({ icon: Icon, label, sub, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
            className="card hover:shadow-card-hover transition-all cursor-pointer flex flex-col items-center text-center gap-3 py-6"
          >
            <div className={`w-10 h-10 rounded-card flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-text-primary">{label}</p>
            <p className="text-xs text-text-muted">{sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
