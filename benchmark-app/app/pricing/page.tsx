import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for teams of all sizes',
};

// Dynamic pricing data (could be fetched from API)
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

const plans = [
  {
    name: 'Starter',
    price: '$10',
    period: 'per month',
    description: 'Perfect for personal projects and small websites',
    features: [
      '5GB Storage',
      '100GB Bandwidth',
      '1 Team Member',
      'SSL Certificate',
      'Basic Analytics',
      'Community Support',
      '10 Serverless Functions',
      '100 Build Minutes/month'
    ],
    highlighted: false,
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    price: '$25',
    period: 'per month',
    description: 'For growing businesses and production applications',
    features: [
      '50GB Storage',
      '500GB Bandwidth',
      '5 Team Members',
      'SSL Certificate',
      'Advanced Analytics',
      'Priority Support',
      '100 Serverless Functions',
      '500 Build Minutes/month',
      'Custom Domains',
      'Preview Deployments',
      'Automatic Backups'
    ],
    highlighted: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'Custom solutions for large-scale applications',
    features: [
      'Unlimited Storage',
      'Unlimited Bandwidth',
      'Unlimited Team Members',
      'SSL Certificate',
      'Custom Analytics',
      'Dedicated Support',
      'Unlimited Serverless Functions',
      'Unlimited Build Minutes',
      'Custom SLA',
      'Advanced Security',
      'Compliance Certifications',
      'White-glove Onboarding'
    ],
    highlighted: false,
    cta: 'Contact Sales'
  }
];

const faqs = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and can invoice for annual contracts.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required.'
  },
  {
    question: 'What happens if I exceed my limits?',
    answer: 'We\'ll notify you before you hit your limits. You can upgrade or we\'ll pause your deployments until the next billing cycle.'
  }
];

export default async function PricingPage() {
  // Simulate API call for dynamic pricing
  await new Promise(resolve => setTimeout(resolve, 100));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg p-8 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white shadow-2xl scale-105'
                    : 'bg-white shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`ml-2 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg
                        className={`w-5 h-5 mr-3 ${plan.highlighted ? 'text-white' : 'text-green-500'}`}
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
                      <span className={plan.highlighted ? 'text-white' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Contact our sales team →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
