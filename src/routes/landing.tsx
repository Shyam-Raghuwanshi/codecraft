/**
 * Landing Page for CodeCraft
 * Modern, responsive landing page with features, testimonials, and CTA
 */

import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import {
  GithubIcon,
  StarIcon,
  CodeIcon,
  ErrorIcon,
  TrendUpIcon,
  ShieldIcon,
  ZapIcon,
  EyeIcon,
  CheckIcon
} from '../lib/icons'

// Hero Section Component
const HeroSection = () => {
  const { isSignedIn } = useAuth()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-blue-900 to-purple-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent)] animate-pulse"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl mb-8 animate-float">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Code<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Craft</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered code review and error tracking dashboard for GitHub repositories. 
            Catch bugs early, improve code quality, and ship better software.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {isSignedIn ? (
            <Link to="/" className="btn btn-primary btn-lg glow-blue">
              <EyeIcon size="sm" />
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/signin" className="btn btn-primary btn-lg glow-blue">
              <TrendUpIcon size="sm" />
              Get Started Free
            </Link>
          )}
          <button className="btn btn-secondary btn-lg">
            <EyeIcon size="sm" />
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
            <div className="text-slate-400 text-sm">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
            <div className="text-slate-400 text-sm">Issues Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
            <div className="text-slate-400 text-sm">Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
            <div className="text-slate-400 text-sm">Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: <GithubIcon size="lg" color="primary" />,
      title: "GitHub Integration",
      description: "Seamlessly connect your GitHub repositories and get instant analysis of your entire codebase with just one click.",
      highlight: "One-click setup"
    },
    {
      icon: <ZapIcon size="lg" color="warning" />,
      title: "AI-Powered Reviews",
      description: "Advanced AI algorithms analyze your code for bugs, security issues, performance problems, and style inconsistencies.",
      highlight: "Smart detection"
    },
    {
      icon: <ErrorIcon size="lg" color="error" />,
      title: "Real-time Error Tracking",
      description: "Monitor runtime errors with Sentry integration. Get detailed stack traces and user impact analysis instantly.",
      highlight: "Live monitoring"
    },
    {
      icon: <ShieldIcon size="lg" color="success" />,
      title: "Security Analysis",
      description: "Detect security vulnerabilities, exposed secrets, and potential attack vectors before they reach production.",
      highlight: "Stay secure"
    },
    {
      icon: <EyeIcon size="lg" color="primary" />,
      title: "Analytics Dashboard",
      description: "Beautiful, responsive dashboard with real-time metrics, trends, and actionable insights for your team.",
      highlight: "Data-driven"
    },
    {
      icon: <CodeIcon size="lg" color="secondary" />,
      title: "Performance Insights",
      description: "Identify performance bottlenecks, memory leaks, and optimization opportunities with detailed analysis.",
      highlight: "Optimize code"
    }
  ]

  return (
    <section className="py-20 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Everything you need to ship better code
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            CodeCraft combines the power of AI-driven code analysis with real-time error monitoring 
            to give you complete visibility into your application's health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card card-hover group p-8 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-6 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">{feature.description}</p>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-900/50 text-blue-300 rounded-full border border-blue-700">
                {feature.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Connect Repository",
      description: "Link your GitHub repository in seconds. No complex setup required.",
      icon: <GithubIcon size="lg" color="primary" />
    },
    {
      step: "02",
      title: "AI Analysis",
      description: "Our AI scans your code for issues, security vulnerabilities, and optimizations.",
      icon: <ZapIcon size="lg" color="warning" />
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Review detailed reports, track metrics, and monitor errors in real-time.",
      icon: <EyeIcon size="lg" color="primary" />
    },
    {
      step: "04",
      title: "Ship Better Code",
      description: "Fix issues early, improve quality, and deploy with confidence.",
      icon: <CheckIcon size="lg" color="success" />
    }
  ]

  return (
    <section className="py-20 bg-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            How CodeCraft Works
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Get started in minutes and see immediate improvements in your code quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-600 transition-colors">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "CodeCraft helped us reduce bugs by 60% before they reached production. The AI analysis is incredibly accurate.",
      author: "Sarah Chen",
      role: "Senior Developer",
      company: "TechFlow Inc.",
      avatar: "SC"
    },
    {
      quote: "The real-time error tracking saved us hours of debugging. We catch issues immediately and fix them fast.",
      author: "Michael Rodriguez",
      role: "Team Lead",
      company: "StartupLabs",
      avatar: "MR"
    },
    {
      quote: "Amazing tool! The security analysis alone has prevented multiple vulnerabilities from going live.",
      author: "Jennifer Kim",
      role: "DevOps Engineer",
      company: "SecureCode",
      avatar: "JK"
    }
  ]

  return (
    <section className="py-20 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Trusted by developers worldwide
          </h2>
          <p className="text-xl text-slate-300">
            See what teams are saying about CodeCraft
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-8">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size="sm" color="warning" />
                ))}
              </div>
              <blockquote className="text-slate-300 italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal projects and getting started",
      features: [
        "Up to 3 repositories",
        "Basic code analysis",
        "GitHub integration",
        "Email support",
        "Community access"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For professional developers and small teams",
      features: [
        "Unlimited repositories",
        "Advanced AI analysis",
        "Real-time error tracking",
        "Security vulnerability scan",
        "Priority support",
        "Team collaboration",
        "Custom integrations"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "SSO integration",
        "Custom deployment",
        "Dedicated support",
        "SLA guarantee",
        "Advanced analytics",
        "Custom training"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <section className="py-20 bg-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-300">
            Choose the plan that fits your needs. Always cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500 card-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-2">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-slate-300">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer Component
const FooterSection = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">CodeCraft</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              AI-powered code review and error tracking for modern development teams. 
              Ship better code with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <GithubIcon size="md" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <CodeIcon size="md" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2025 CodeCraft. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterSection />
    </div>
  )
}

export const Route = createFileRoute('/landing')({
  component: LandingPage,
})

// Also export default for compatibility
export default LandingPage