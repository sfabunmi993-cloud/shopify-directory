import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getService } from '@/data/services';
import { ArrowRight, CheckCircle, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const service = getService(serviceId);

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">Service not found</p>
        <Button asChild variant="outline" className="mt-4 rounded-full">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            ← Back home
          </Link>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Service
              </span>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{service.title}</h1>
              </div>
              <p className="text-lg text-muted-foreground mt-5 leading-relaxed">{service.overview}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full text-base h-12 px-8">
                  <Link to={`/directory?category=${service.category}`}>Hire an expert <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full text-base h-12 px-8">
                  <Link to="/directory">Browse all partners</Link>
                </Button>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-primary/10 shadow-xl">
              <img src={service.hero} alt={service.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-8">What's included</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {service.includes.map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-16 bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-8">What you'll get</h2>
          <div className="space-y-3">
            {service.deliverables.map((d) => (
              <div key={d} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-3">
            {service.faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold">Ready to hire a {service.title.toLowerCase()} expert?</h2>
          <p className="text-primary-foreground/80 mt-3 text-lg">Browse partners specialized in this service and hire with confidence.</p>
          <Button asChild size="lg" variant="secondary" className="rounded-full text-base h-12 px-8 mt-6 bg-white text-primary hover:bg-white/90">
            <Link to={`/directory?category=${service.category}`}>Hire an expert <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}