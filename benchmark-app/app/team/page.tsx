import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'Meet the team behind the platform',
};

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: '15+ years in cloud infrastructure and developer tools',
    avatar: '/team/avatar-1.jpg',
    twitter: '@sarahchen',
    linkedin: 'sarah-chen'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    bio: 'Former infrastructure lead at major tech companies',
    avatar: '/team/avatar-2.jpg',
    twitter: '@marcusdev',
    linkedin: 'marcus-rodriguez'
  },
  {
    name: 'Emily Watson',
    role: 'VP of Engineering',
    bio: 'Scaling systems expert with 10+ years experience',
    avatar: '/team/avatar-3.jpg',
    twitter: '@emilywatson',
    linkedin: 'emily-watson'
  },
  {
    name: 'James Kim',
    role: 'Head of DevOps',
    bio: 'Cloud architecture and automation specialist',
    avatar: '/team/avatar-4.jpg',
    twitter: '@jameskim',
    linkedin: 'james-kim'
  },
  {
    name: 'Priya Patel',
    role: 'Lead Product Designer',
    bio: 'Creating delightful developer experiences',
    avatar: '/team/avatar-5.jpg',
    twitter: '@priyapateld',
    linkedin: 'priya-patel'
  },
  {
    name: 'Alex Thompson',
    role: 'Head of Customer Success',
    bio: 'Ensuring our customers succeed every day',
    avatar: '/team/avatar-6.jpg',
    twitter: '@alexthompson',
    linkedin: 'alex-thompson'
  }
];

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Meet Our Team</h1>
          <p className="text-xl max-w-2xl mx-auto">
            We're a group of passionate developers, designers, and infrastructure experts
            building the future of web hosting.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-gray-200 relative">
                  {/* Placeholder for avatar - using Next.js Image component for optimization */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-6xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>

                  <div className="flex gap-3">
                    <a
                      href={`https://twitter.com/${member.twitter.replace('@', '')}`}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                      </svg>
                    </a>
                    <a
                      href={`https://linkedin.com/in/${member.linkedin}`}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="bg-gray-50 py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're always looking for talented people to join our mission.
          </p>
          <a
            href="/contact"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            View Open Positions
          </a>
        </div>
      </section>
    </div>
  );
}
