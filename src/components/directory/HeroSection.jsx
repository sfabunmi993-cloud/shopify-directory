import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
{ label: 'Marketing and sales', value: 'marketing_and_sales' },
{ label: 'Store setup and management', value: 'store_setup_and_management' },
{ label: 'Development and troubleshooting', value: 'development_and_troubleshooting' },
{ label: 'Visual content and branding', value: 'visual_content_and_branding' },
{ label: 'Content writing', value: 'content_writing' },
{ label: 'Expert guidance', value: 'expert_guidance' }];


export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-muted/40 via-background to-muted/60 pt-16 pb-20 md:pt-20 md:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.4rem] font-bold text-foreground leading-tight tracking-tight">
              Find service partners
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Browse by price, location, services, and more to find a partner that meets your needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) =>
              <Link
                key={cat.value}
                to={`/directory?category=${cat.value}`}
                className="inline-flex items-center px-4 py-2.5 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-foreground hover:shadow-sm transition-all duration-200">
                
                  {cat.label}
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  <div className="w-28 h-28 rounded-2xl bg-card shadow-lg border border-border/50 flex items-center justify-center overflow-hidden">
                    <img src="https://media.base44.com/images/public/6a25a3e760ebc5e135a0582b/a811d5dd6_pskv.PNG" alt="Partner" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-28 h-28 rounded-2xl bg-card shadow-lg border border-border/50 flex items-center justify-center overflow-hidden mt-6">
                    <img src="https://media.base44.com/images/public/6a25a3e760ebc5e135a0582b/bdffef563_WhatsApp_Image_2026-06-09_at_061602.jpeg" alt="Partner" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full bg-primary/15" />
            </div>
          </div>
        </div>
      </div>
    </section>);

}