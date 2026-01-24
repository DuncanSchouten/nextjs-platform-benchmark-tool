import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CaseStudy {
  slug: string;
  company: string;
  industry: string;
  title: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: Array<{ value: string; label: string }>;
  testimonial: { quote: string; author: string; role: string };
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'ecommerce-scale',
    company: 'ShopFlow',
    industry: 'E-Commerce',
    title: 'Scaling to 1M+ Daily Users',
    description: 'ShopFlow is a rapidly growing e-commerce platform serving millions of customers worldwide.',
    challenge: `ShopFlow was experiencing major scaling issues during peak shopping seasons. Their previous hosting solution couldn't handle traffic spikes during Black Friday and Cyber Monday, leading to downtime and lost revenue.

Key challenges included:
- Infrastructure that couldn't auto-scale quickly enough
- Database performance bottlenecks
- Slow deployment times preventing critical fixes
- Limited visibility into system performance`,
    solution: `ShopFlow migrated their entire stack to our platform, leveraging:
- Auto-scaling infrastructure that responds to traffic in real-time
- Edge caching for static assets and API responses
- Database read replicas across multiple regions
- Preview deployments for testing before going live
- Real-time performance monitoring and alerts`,
    results: [
      'Handled 10x traffic increase during Black Friday with zero downtime',
      'Reduced page load times by 60%',
      'Deployment time decreased from 30 minutes to 2 minutes',
      'Saved $50K/month on infrastructure costs',
      'Improved developer productivity by 40%'
    ],
    metrics: [
      { value: '99.99%', label: 'Uptime during peak season' },
      { value: '10x', label: 'Traffic capacity increase' },
      { value: '60%', label: 'Faster page loads' },
      { value: '$50K', label: 'Monthly cost savings' }
    ],
    testimonial: {
      quote: 'The platform handled our Black Friday traffic flawlessly. We saw zero downtime and actually reduced our infrastructure costs. It\'s been transformative for our business.',
      author: 'Sarah Chen',
      role: 'CTO, ShopFlow'
    }
  },
  {
    slug: 'fintech-security',
    company: 'SecurePay',
    industry: 'FinTech',
    title: 'Meeting SOC 2 Compliance',
    description: 'SecurePay provides payment processing solutions for enterprises with strict security requirements.',
    challenge: `SecurePay needed to achieve SOC 2 Type II compliance to serve enterprise customers, but their existing infrastructure made compliance difficult and deployments risky.

Challenges included:
- No audit trail for infrastructure changes
- Manual security patching processes
- Inconsistent environments between dev and production
- Slow compliance review processes`,
    solution: `We worked with SecurePay to implement:
- Infrastructure as Code with full audit trails
- Automated security scanning in CI/CD pipeline
- Environment parity across all stages
- Compliance dashboard and reporting
- Dedicated support for compliance requirements`,
    results: [
      'Achieved SOC 2 Type II compliance in 3 months',
      'Reduced security patching time from days to hours',
      'Deployment frequency increased 5x with maintained security',
      'Passed compliance audits with zero major findings',
      '100% environment consistency'
    ],
    metrics: [
      { value: '3 months', label: 'To SOC 2 compliance' },
      { value: '5x', label: 'More frequent deployments' },
      { value: '0', label: 'Compliance audit findings' },
      { value: '100%', label: 'Environment parity' }
    ],
    testimonial: {
      quote: 'Achieving SOC 2 compliance while maintaining development velocity seemed impossible. This platform made it happen. We now deploy faster than ever while meeting enterprise security standards.',
      author: 'Marcus Rodriguez',
      role: 'VP Engineering, SecurePay'
    }
  },
  {
    slug: 'media-performance',
    company: 'StreamVision',
    industry: 'Media & Entertainment',
    title: 'Global Content Delivery',
    description: 'StreamVision delivers video streaming services to audiences worldwide.',
    challenge: `StreamVision\'s users were experiencing high latency and buffering issues in regions outside North America. Their CDN solution was expensive and difficult to configure.

Pain points:
- High latency in APAC and European markets
- Expensive bandwidth costs
- Complex CDN configuration
- Limited visibility into regional performance`,
    solution: `StreamVision leveraged our global edge network:
- Content delivery from 150+ locations worldwide
- Automatic geo-routing to nearest edge location
- Intelligent caching for video assets
- Real-time analytics by region
- Edge compute for personalization`,
    results: [
      'Reduced global latency by 60%',
      'Bandwidth costs decreased by 40%',
      'Buffering incidents reduced by 85%',
      'Expanded to 50 new countries',
      'User engagement increased 30%'
    ],
    metrics: [
      { value: '60%', label: 'Latency reduction' },
      { value: '150+', label: 'Global edge locations' },
      { value: '85%', label: 'Fewer buffering incidents' },
      { value: '40%', label: 'Lower bandwidth costs' }
    ],
    testimonial: {
      quote: 'Our viewers in Asia and Europe are now getting the same high-quality experience as North American users. The platform\'s global edge network has been a game-changer for our international expansion.',
      author: 'Emily Watson',
      role: 'Head of Infrastructure, StreamVision'
    }
  }
];

export async function generateStaticParams() {
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${study.company} - ${study.title}`,
    description: study.description,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-sm font-semibold mb-4 uppercase">{study.industry}</div>
          <h1 className="text-5xl font-bold mb-6">{study.company}: {study.title}</h1>
          <p className="text-xl">{study.description}</p>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {study.metrics.map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{metric.value}</div>
                <div className="text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
          <div className="prose prose-lg max-w-none">
            {study.challenge.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">The Solution</h2>
          <div className="prose prose-lg max-w-none">
            {study.solution.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">The Results</h2>
          <ul className="space-y-4">
            {study.results.map((result, idx) => (
              <li key={idx} className="flex items-start">
                <svg
                  className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-lg text-gray-700">{result}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-2xl font-light italic mb-6">
            "{study.testimonial.quote}"
          </blockquote>
          <div className="font-semibold">{study.testimonial.author}</div>
          <div className="text-blue-100">{study.testimonial.role}</div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join {study.company} and thousands of other companies building on our platform.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </a>
            <a
              href="/case-studies"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors border border-blue-600"
            >
              More Case Studies
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
