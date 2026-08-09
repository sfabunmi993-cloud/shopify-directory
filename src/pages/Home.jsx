import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Star, ShieldCheck, MessageSquare, ThumbsUp, Circle, Crosshair, Atom, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/data/services';
import SiteFooter from '@/components/home/SiteFooter';

const STEPS = [
{ icon: Search, title: 'Browse', text: 'Refine your search based on what matters most to you, such as price, location, and services.' },
{ icon: ThumbsUp, title: 'Evaluate', text: 'Check reviews, work samples, certifications, and more to make an informed choice.' },
{ icon: MessageSquare, title: 'Contact and collaborate', text: 'Communicate directly with the partner, set your project terms, and start collaborating.' }];


const TIERS = [
{ icon: Circle, label: 'Select partners' },
{ icon: Crosshair, label: 'Plus partners' },
{ icon: Atom, label: 'Premier partners' }];


export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/directory?search=${encodeURIComponent(query.trim())}` : '/directory');
  };

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gray-100">
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
              <div className="mt-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by keyword, service, partner name, or country"
                      className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-gray-300 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    />
                  </div>
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-black text-white hover:bg-black/90 shrink-0">
                    <Search className="w-5 h-5" />
                  </Button>
                </form>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full text-base h-12 px-8 bg-black text-white sm:bg-gray-950">
                  <Link to="/directory" className="bg-[#843e3e]">Hire an expert</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full text-base h-12 px-8 bg-black text-white border-black sm:bg-transparent sm:text-foreground sm:border-input">
                  <a href="https://www.shopify.com/" target="_blank" rel="noopener noreferrer">Login</a>
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
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://cdn.shopify.com/b/shopify-brochure2-assets/440badc0499b9f199ed6577dea18f9a7.png?height=740"
                  alt="Shopify Partners"
                  className="w-full h-full object-cover" />
                
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
                </Link>);

            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-[#151c1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4ff8a]">How it works</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-3">Hire quickly with confidence</h2>
            <p className="text-white/60 mt-3">
              Partners listed in the directory work independently to provide you with the best service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title}>
                  <div className="w-12 h-12 rounded-xl bg-[#d4ff8a] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-[#151c1a]" strokeWidth={2} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed max-w-xs">{step.text}</p>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* PARTNER TIERS */}
      <section
        className="py-16 lg:py-24 bg-[#F4F7F6]"
        style={{
          backgroundImage:
          'linear-gradient(to right, rgba(180,200,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(180,200,255,0.25) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666]">Partner tiers</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#111111] mt-3">Find the right fit</h2>
            <p className="text-[#444444] mt-3">
              Partners are tiered based on multiple factors, including their history of experience and proven success on Shopify.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-[#DDDDDD] overflow-hidden">
            {TIERS.map((t, i) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  className={`flex items-center justify-between gap-4 px-5 sm:px-8 py-5 ${i > 0 ? 'border-t border-[#EEEEEE]' : ''}`}>
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-[#C8F08F] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#151c1a]" strokeWidth={2} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-black truncate">{t.label}</h3>
                  </div>
                  <Link
                    to="/directory"
                    className="inline-flex items-center gap-1 text-sm font-medium text-black underline underline-offset-2 shrink-0">
                    
                    Browse <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>);

            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      







      

      {/* OPTIONS CTA */}
      <section className="bg-[#2C3E45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A5D6A7]">You've got options</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-3">
                Download apps or use software integrations
              </h2>
              <p className="text-white/80 mt-3 text-base sm:text-lg">
                Find technology solutions that suit your growing business.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white text-white hover:bg-white hover:text-[#2C3E45] bg-transparent px-8 h-12 text-base shrink-0">
              
              <Link to="/directory">Browse</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>);

}