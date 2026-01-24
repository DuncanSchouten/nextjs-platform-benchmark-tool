import { Metadata } from 'next';
import { FaRocket, FaServer, FaChartLine, FaShieldAlt, FaCog, FaCloud } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Our Services',
  description: 'Comprehensive hosting and deployment services for modern web applications',
};

const services = [
  {
    icon: FaRocket,
    title: 'Fast Deployments',
    description: 'Deploy your applications in seconds with our optimized build pipeline. Automatic rollbacks and zero-downtime deployments ensure your users never experience interruptions.',
    features: ['Instant rollbacks', 'Preview deployments', 'CI/CD integration']
  },
  {
    icon: FaServer,
    title: 'Edge Network',
    description: 'Leverage our global edge network to deliver content with minimal latency. Your application runs closer to your users, ensuring blazing-fast performance worldwide.',
    features: ['150+ locations', 'Automatic geo-routing', 'DDoS protection']
  },
  {
    icon: FaChartLine,
    title: 'Performance Analytics',
    description: 'Real-time insights into your application performance. Track Core Web Vitals, monitor uptime, and identify bottlenecks before they impact users.',
    features: ['Real-time monitoring', 'Custom alerts', 'Historical trends']
  },
  {
    icon: FaShieldAlt,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security features protect your application and data. SOC 2 certified with automatic SSL, DDoS mitigation, and WAF protection.',
    features: ['Automatic SSL', 'SOC 2 certified', 'Regular audits']
  },
  {
    icon: FaCog,
    title: 'Auto Scaling',
    description: 'Automatically scale to handle traffic spikes. Pay only for what you use with our intelligent scaling system that adapts to your application needs.',
    features: ['Serverless functions', 'Horizontal scaling', 'Load balancing']
  },
  {
    icon: FaCloud,
    title: 'Cloud Infrastructure',
    description: 'Built on leading cloud providers for maximum reliability. Multi-region redundancy ensures your application stays online even during outages.',
    features: ['99.99% uptime SLA', 'Multi-region', 'Automated backups']
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            Enterprise-Grade Hosting Services
          </h1>
          <p className="text-xl max-w-2xl">
            Everything you need to deploy, scale, and monitor modern web applications.
            Built for developers, trusted by enterprises.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
                >
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>

                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <svg
                          className="w-5 h-5 mr-2 text-green-500"
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
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Deploy your first application in minutes. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </a>
            <a
              href="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors border border-blue-600"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
