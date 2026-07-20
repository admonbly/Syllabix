'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const ct = (k) => t(`contact.${k}`);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO : brancher l'envoi réel du message (email/back-office)
    alert(ct('form.success'));
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">{ct('title')}</h1>
        <p className="section-subtitle">{ct('subtitle')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card icon="📧" title={ct('cards.email')} description="contact@syllabix.net" />
          <Card icon="💼" title={ct('cards.linkedin')} description={<a href="https://www.linkedin.com/company/syllabix" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">linkedin.com/company/syllabix</a>} />
          <Card icon="🕐" title={ct('cards.hours')} description={ct('cards.hoursVal')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              {ct('form.title')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {ct('form.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {ct('form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {ct('form.subject')}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  {ct('form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-neutral-200 rounded-lg focus:border-accent outline-none resize-none h-32"
                  required
                />
              </div>

              <CTAButton type="submit" className="w-full" size="lg">
                {ct('form.submit')}
              </CTAButton>
            </form>
          </Card>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              {ct('faq.title')}
            </h3>

            {ct('faq.items').map((item) => (
              <Card key={item.q} className="p-6">
                <h4 className="font-heading font-bold text-primary mb-2">{item.q}</h4>
                <p className="text-neutral-600 text-sm">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
