/**
 * Composant JSON-LD pour les données structurées Schema.org
 * Aide les moteurs de recherche et le chatbot à comprendre le contenu.
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Syllabix',
    description: 'Plateforme de certification des compétences numériques en Afrique',
    url: 'https://syllabix.vercel.app',
    areaServed: 'Africa',
    inLanguage: 'fr',
    offers: {
      '@type': 'Offer',
      name: 'Certification compétences numériques',
      description: '7 modules : IT, Internet, Email, Bureautique, Cybersécurité, IA, Employabilité',
      price: '0',
      priceCurrency: 'XOF',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function CourseJsonLd({ title, description, url }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description,
    url,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Syllabix',
    },
    inLanguage: 'fr',
    isAccessibleForFree: true,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
