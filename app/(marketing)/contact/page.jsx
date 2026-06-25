'use client';

import Card from '@/components/Card';
import CTAButton from '@/components/CTAButton';
import { useState } from 'react';

export default function ContactPage() {
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
    console.log('Form submitted:', formData);
    // Here you would integrate with Supabase to save the contact
    alert('Merci! Nous vous répondrons bientôt.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-20 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title">Nous Contacter</h1>
        <p className="section-subtitle">
          Vous avez une question? Nous sommes là pour vous aider.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card icon="📧" title="Email" description="contact@syllabix.com" />
          <Card icon="💼" title="LinkedIn" description={<a href="https://www.linkedin.com/company/syllabix" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">linkedin.com/company/syllabix</a>} />
          <Card icon="🕐" title="Horaires" description="Lun-Ven: 9h-18h UTC" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              Envoyez-nous un message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Nom complet
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
                  Email
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
                  Sujet
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
                  Message
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
                Envoyer
              </CTAButton>
            </form>
          </Card>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6">
              Questions Fréquentes
            </h3>

            <Card className="p-6">
              <h4 className="font-heading font-bold text-primary mb-2">
                Combien coûte la certification?
              </h4>
              <p className="text-neutral-600 text-sm">
                La certification est gratuite! Vous pouvez passer autant d'évaluations que vous le souhaitez.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-heading font-bold text-primary mb-2">
                Combien de temps pour obtenir le certificat?
              </h4>
              <p className="text-neutral-600 text-sm">
                Le certificat est généré immédiatement après avoir passé l'examen avec un score {`>= 60%`}.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-heading font-bold text-primary mb-2">
                Le certificat est-il reconnu?
              </h4>
              <p className="text-neutral-600 text-sm">
                Oui! Nos certificats sont reconnus par les employeurs et les institutions partenaires.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-heading font-bold text-primary mb-2">
                Puis-je repasser l'examen?
              </h4>
              <p className="text-neutral-600 text-sm">
                Oui! Vous pouvez repasser l'examen autant de fois que vous le souhaitez pour améliorer votre score.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
