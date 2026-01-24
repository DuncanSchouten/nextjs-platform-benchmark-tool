import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

// Dynamic route for individual blog posts
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'understanding-build-times',
    title: 'Understanding Build Times in Modern Web Development',
    excerpt: 'A deep dive into what affects build performance and how to optimize it.',
    content: `Build performance is a critical factor in developer productivity. In this article, we'll explore the various factors that influence build times in modern web applications.

## What Affects Build Time?

Several factors contribute to build performance:

1. **Bundle Size**: Larger applications take longer to compile
2. **Dependencies**: More npm packages = more processing
3. **Code Complexity**: Complex transformations slow builds
4. **Platform Infrastructure**: Hardware and software optimizations

## Optimization Strategies

To improve build times, consider:

- Tree-shaking unused code
- Using modern bundlers (Turbopack, esbuild)
- Parallelizing build tasks
- Caching effectively
- Optimizing images and assets

The key is understanding your bottlenecks through measurement and profiling.`,
    date: '2024-01-15',
    author: 'Engineering Team',
    category: 'Performance',
    readTime: '5 min read'
  },
  {
    slug: 'platform-comparison',
    title: 'Platform Comparison: What to Look For',
    excerpt: 'Key metrics and features to consider when choosing a hosting platform.',
    content: `Choosing the right hosting platform is crucial for your application's success. Here's what to evaluate.

## Key Considerations

### Performance Metrics
- Build and deployment speed
- Time to First Byte (TTFB)
- Global CDN coverage
- Edge function latency

### Developer Experience
- Git integration quality
- Preview deployments
- Environment variables management
- Build logs and debugging

### Scalability
- Auto-scaling capabilities
- Traffic handling
- Resource limits
- Pricing at scale

Make data-driven decisions based on your specific needs and traffic patterns.`,
    date: '2024-01-10',
    author: 'DevOps Team',
    category: 'Infrastructure',
    readTime: '7 min read'
  },
  {
    slug: 'nextjs-deployment-evolution',
    title: 'The Evolution of Next.js Deployment',
    excerpt: 'How deployment strategies have changed with Next.js 14 and beyond.',
    content: `Next.js deployment has evolved significantly. Let's explore the journey.

## Early Days

Initially, Next.js required manual server management and configuration. Deployment meant setting up Node.js servers and reverse proxies.

## The Vercel Revolution

Vercel (formerly Zeit) introduced one-click deployments, making Next.js accessible to everyone.

## Modern Platforms

Today, multiple platforms offer first-class Next.js support:
- Serverless deployments
- Edge computing
- Hybrid rendering
- Advanced caching strategies

The ecosystem continues to evolve with new optimizations and capabilities.`,
    date: '2024-01-05',
    author: 'Platform Team',
    category: 'Next.js',
    readTime: '6 min read'
  },
  {
    slug: 'core-web-vitals',
    title: 'Optimizing for Core Web Vitals',
    excerpt: 'Best practices for improving your application\'s performance metrics.',
    content: `Core Web Vitals are essential for user experience and SEO. Here's how to optimize them.

## The Three Pillars

### Largest Contentful Paint (LCP)
Target: under 2.5 seconds
- Optimize images
- Minimize render-blocking resources
- Use CDN for assets

### First Input Delay (FID)
Target: under 100ms
- Reduce JavaScript execution time
- Code splitting
- Defer non-critical JS

### Cumulative Layout Shift (CLS)
Target: under 0.1
- Reserve space for images
- Avoid inserting content dynamically
- Use CSS containment

Monitor these metrics continuously and iterate based on real user data.`,
    date: '2024-01-01',
    author: 'Performance Team',
    category: 'Optimization',
    readTime: '8 min read'
  }
];

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center text-gray-600">
            <span>By {post.author}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-2xl font-bold mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl font-semibold mt-6 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              return (
                <li key={idx} className="ml-6">
                  {paragraph.replace('- ', '')}
                </li>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href="/blog"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to all posts
          </a>
        </div>
      </article>
    </div>
  );
}
