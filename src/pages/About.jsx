import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/5 border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-4">About Shopify Partners Directory</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connecting Shopify store owners with trusted, verified experts who help businesses grow.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-12">

        {/* What we do */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">What We Do</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            Shopify Partners Directory is the go-to platform for discovering skilled Shopify partners — from developers and designers to marketing experts and business consultants. We curate a vetted list of professionals who have demonstrated real results for Shopify merchants worldwide. Whether you are launching your first store, optimizing an existing one, or scaling to new markets, our directory helps you find the right partner quickly and confidently.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base mt-4">
            Every partner on our platform goes through a review process before being listed publicly. We highlight their services, completed projects, client reviews, and tier rankings — so you can make an informed decision without spending hours searching across the web.
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

        {/* Our story */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed text-base">
            Shopify Partners Directory started with a simple frustration: finding the right Shopify expert felt like searching for a needle in a haystack. Merchants were left to gamble on freelance marketplaces, skim scattered reviews, and hope for the best — while talented partners struggled to stand out in a sea of noise. We knew there had to be a better way. So we built a dedicated space where proven Shopify professionals could be discovered, compared, and hired with confidence. Our mission is to make every Shopify store owner's journey smoother by connecting them with partners who have already helped real businesses succeed. We focus on transparency, verified results, and honest reviews, so the trust is built into the platform itself. From store setup and custom development to marketing, branding, and growth strategy, our partners cover the full lifecycle of a Shopify business. Today, the directory serves a growing global community of merchants and experts, and we are just getting started. Every new partner, review, and success story pushes us closer to a world where no merchant ever has to guess when choosing the right help for their store.
          </p>
        </section>

        {/* Who builds it */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-4">Who Builds It</h2>
          <p className="text-muted-foreground leading-relaxed text-base">Shopify Partners Directory is built and maintained by Fabunmi Samuel George And Omoniyi Enitan Johnson dedicated team  leader passionate about the Shopify ecosystem. We are a group of e-commerce enthusiasts, developers, and community builders who believe that finding the right expert should be simple, transparent, and accessible to everyone. Our team continuously improves the platform based on feedback from both partners and merchants to ensure the best possible experience on all sides.

          </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/directory">Browse Partners</Link>
          </Button>
        </div>
      </div>
    </div>);

}