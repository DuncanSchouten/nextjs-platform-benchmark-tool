import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'See how companies are succeeding with our platform',
};

const caseStudies = [
  {
    slug: 'ecommerce-scale',
    company: 'ShopFlow',
    industry: 'E-Commerce',
    title: 'Scaling to 1M+ Daily Users',
    excerpt: 'How ShopFlow handled Black Friday traffic with zero downtime',
    metric: '99.99% uptime',
    metricLabel: 'During peak traffic',
    logo: '/case-studies/shopflow-logo.svg',
    image: '/case-studies/shopflow-hero.jpg'
  },
  {
    slug: 'fintech-security',
    company: 'SecurePay',
    industry: 'FinTech',
    title: 'Meeting SOC 2 Compliance',
    excerpt: 'Achieving enterprise security standards without sacrificing speed',
    metric: '50% faster',
    metricLabel: 'Deployment time',
    logo: '/case-studies/securepay-logo.svg',
    image: '/case-studies/securepay-hero.jpg'
  },
  {
    slug: 'media-performance',
    company: 'StreamVision',
    industry: 'Media & Entertainment',
    title: 'Global Content Delivery',
    excerpt: 'Delivering video content to 150+ countries with minimal latency',
    metric: '60% reduction',
    metricLabel: 'In latency',
    logo: '/case-studies/streamvision-logo.svg',
    image: '/case-studies/streamvision-hero.jpg'
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Customer Success Stories</h1>
          <p className="text-xl max-w-2xl">
            Discover how leading companies use our platform to build, deploy, and scale
            their applications.
          </p>
        </div>
      </section>

      {/* Case Studies List */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-1 gap-8">
            {caseStudies.map((study) => (
              <Link
                key={study.slug}
                href={`/case-studies/${study.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-2/5 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold h-64 md:h-auto">
                    {study.company}
                  </div>

                  {/* Content */}
                  <div className="md:w-3/5 p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-blue-600 uppercase">
                        {study.industry}
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      {study.title}
                    </h2>

                    <p className="text-gray-600 mb-6 text-lg">
                      {study.excerpt}
                    </p>

                    <div className="flex items-center gap-8 mb-6">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {study.metric}
                        </div>
                        <div className="text-sm text-gray-500">
                          {study.metricLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-blue-600 font-semibold group-hover:gap-2 flex items-center transition-all">
                      Read case study
                      <svg
                        className="w-5 h-5 ml-2 group-hover:ml-3 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of companies building on our platform.
          </p>
          <a
            href="/contact"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
