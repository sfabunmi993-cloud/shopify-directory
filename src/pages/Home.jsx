import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, ShieldCheck, MessageSquare, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/data/services';
import SiteFooter from '@/components/home/SiteFooter';

const STEPS = [
  { icon: Search, title: 'Browse', text: 'Refine your search based on what matters most to you, such as price, location, and services.' },
  { icon: Star, title: 'Evaluate', text: 'Check reviews, work samples, certifications, and more to make an informed choice.' },
  { icon: MessageSquare, title: 'Contact and collaborate', text: 'Communicate directly with the partner, set your project terms, and start collaborating.' }
];

const TIERS = [
  { label: 'Select partners', desc: 'New and growing partners building their experience on Shopify.', color: 'bg-muted text-muted-foreground', tier: 'standard' },
  { label: 'Plus partners', desc: 'Established partners with a proven history of success.', color: 'bg-primary/10 text-primary', tier: 'plus' },
  { label: 'Premier partners', desc: 'Top-performing partners delivering exceptional results.', color: 'bg-amber-50 text-amber-700', tier: 'premium' },
  { label: 'Platinum partners', desc: 'Our most elite partners with the highest level of expertise.', color: 'bg-slate-100 text-slate-700', tier: 'premium' }
];

export default function Home() {
  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Partner Directory
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mt-4 leading-[1.05] tracking-tight">
                Do more, faster with a Shopify partner
              </h1>
              <p className="text-lg text-muted-foreground mt-5 leading-relaxed max-w-xl">
                Hire partners who fit your needs and budget, freeing you to focus on running your business.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full text-base h-12 px-8">
                  <Link to="/directory">Hire an expert <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full text-base h-12 px-8">
                  <Link to="/become-a-partner">Become a partner</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Verified experts
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Trusted reviews
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-primary/10 shadow-xl">
                <img
                  src="https://cdn.shopify.com/b/shopify-brochure2-assets/440badc0499b9f199ed6577dea18f9a7.png?height=740"
                  alt="Shopify Partners"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">30+ services offered</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-2">Explore popular services</h2>
            <p className="text-muted-foreground mt-3">
              Whether you need help with store setup, design, marketing, or more, find partners for every project.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.id} to={`/services/${s.id}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[16/6] overflow-hidden bg-muted">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.short}</p>
                    <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-2">Hire quickly with confidence</h2>
            <p className="text-muted-foreground mt-3">
              Partners listed in the directory work independently to provide you with the best service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className="relative mx-auto w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.text}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" className="rounded-full text-base h-12 px-8">
              <Link to="/directory">Hire an expert <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PARTNER TIERS */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Partner tiers</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-2">Find the right fit</h2>
            <p className="text-muted-foreground mt-3">
              Partners are tiered based on multiple factors, including their history of experience and proven success on Shopify.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((t) => (
              <div key={t.label} className="rounded-2xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${t.color}`}>
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">{t.label}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.desc}</p>
                <Link
                  to="/directory"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Browse <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Ready to grow your business?</h2>
          <p className="text-primary-foreground/80 mt-3 text-lg">Browse our directory of expert Shopify partners and hire with confidence.</p>
          <Button asChild size="lg" variant="secondary" className="rounded-full text-base h-12 px-8 mt-6 bg-white text-primary hover:bg-white/90">
            <Link to="/directory">Hire an expert <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}