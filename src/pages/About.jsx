import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, ShieldCheck, Globe, ShoppingBag, TrendingUp, Bot, Palette, Mail, Cog, Search, Rocket, Target, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const whatWeDo = [
  { icon: ShoppingBag, label: 'E-commerce and Shopify' },
  { icon: TrendingUp, label: 'Business growth and digital marketing' },
  { icon: Bot, label: 'AI-powered tools and content' },
  { icon: Palette, label: 'Website and online store development' },
  { icon: Mail, label: 'Email marketing and sales funnels' },
  { icon: Cog, label: 'Automation and productivity' },
  { icon: Search, label: 'Online visibility and optimization' },
  { icon: Rocket, label: 'Digital business development' }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/5 border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Building Better Digital Solutions for Modern Businesses</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connecting Shopify store owners with trusted, verified experts who help businesses grow.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-12">

        {/* Intro */}
        <section>
          <p className="text-muted-foreground leading-relaxed text-base">
            Our platform was founded by <span className="font-semibold text-foreground">Fabunmi Samuel</span> and <span className="font-semibold text-foreground">Enitan Omoniyi Johnson</span>, two entrepreneurs passionate about technology, e-commerce, digital marketing, and helping businesses grow online.
          </p>
        </section>

        {/* Our Founders */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-6">Our Founders</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">FS</div>
                <div>
                  <h3 className="font-semibold">Fabunmi Samuel</h3>
                  <p className="text-xs text-muted-foreground">Co-Founder</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fabunmi Samuel is a freelancer, digital marketer, e-commerce entrepreneur, and verified Shopify Partner specializing in Shopify development, digital marketing, AI content creation, sales funnels, automation, and digital business strategy.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                His focus is on helping businesses improve their online presence, attract customers, optimize their digital stores, and turn online opportunities into measurable growth.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">EJ</div>
                <div>
                  <h3 className="font-semibold">Enitan Omoniyi Johnson</h3>
                  <p className="text-xs text-muted-foreground">Co-Founder</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enitan Omoniyi Johnson is a co-founder focused on supporting the development and growth of the platform, contributing to its vision of creating practical digital solutions for entrepreneurs, businesses, and online communities.
              </p>
            </div>
          </div>
        </section>

        {/* What we do */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">What We Do</h2>
          <p className="text-muted-foreground leading-relaxed text-base mb-6">
            Our platform is designed to help entrepreneurs and businesses access practical digital solutions for:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {whatWeDo.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Our Mission */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base">
            Our mission is to make digital technology more accessible, practical, and useful for entrepreneurs and businesses.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base mt-4">
            We want to help people spend less time struggling with complicated digital processes and more time building, marketing, and growing their businesses.
          </p>
        </section>

        {/* Our Vision */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold">Our Vision</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base">
            We envision a digital ecosystem where entrepreneurs can access the tools, knowledge, and technology they need to build successful online businesses from one platform.
          </p>
        </section>

        {/* Our Commitment */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-semibold">Our Commitment</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base">
            We are committed to continuously improving our platform, introducing useful tools, and creating solutions that solve real problems for modern businesses.
          </p>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">Who It's For</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5">
              <Users className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Shopify Store Owners</h3>
              <p className="text-sm text-muted-foreground">Find trusted partners to help set up, grow, and optimize your Shopify store — saving you time and money.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <Star className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Shopify Experts & Agencies</h3>
              <p className="text-sm text-muted-foreground">Showcase your skills and services to thousands of potential clients actively searching for Shopify help.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <Globe className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Global Merchants</h3>
              <p className="text-sm text-muted-foreground">Browse partners by location, language, and specialty to find someone who understands your market.</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <ShieldCheck className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-1">Businesses Seeking Quality</h3>
              <p className="text-sm text-muted-foreground">Every listing is reviewed and verified, so you can trust the partners you find on our platform.</p>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="text-center bg-primary/5 border border-border rounded-2xl p-8">
          <p className="font-heading text-xl font-semibold text-foreground">Built with purpose. Driven by innovation. Focused on growth.</p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Founders</p>
            <p className="font-semibold text-foreground mt-1">Fabunmi Samuel & Enitan Omoniyi Johnson</p>
            <p className="text-xs text-muted-foreground mt-1">Co-Founders</p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/directory">Browse Partners</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}