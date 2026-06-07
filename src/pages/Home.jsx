import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/directory/HeroSection';
import PartnerCard from '@/components/directory/PartnerCard';
import { ArrowRight, Star, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: featuredPartners, isLoading } = useQuery({
    queryKey: ['featured-partners'],
    queryFn: () => base44.entities.Partner.filter({ is_featured: true, status: 'approved' }, '-rating', 6),
    initialData: [],
  });

  const { data: topPartners, isLoading: isLoadingTop } = useQuery({
    queryKey: ['top-partners'],
    queryFn: () => base44.entities.Partner.filter({ status: 'approved' }, '-rating', 8),
    initialData: [],
  });

  const displayPartners = featuredPartners.length > 0 ? featuredPartners : topPartners;
  const loading = isLoading || isLoadingTop;

  return (
    <div>
      <HeroSection />

      {/* Stats */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-heading text-3xl font-bold text-foreground">4,971+</span>
              </div>
              <p className="text-sm text-muted-foreground">Service Partners</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="font-heading text-3xl font-bold text-foreground">4.8</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-heading text-3xl font-bold text-foreground">150+</span>
              </div>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Partners */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Top-rated partners</h2>
              <p className="text-muted-foreground mt-1">Trusted professionals ready to help grow your business</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex text-primary font-medium">
              <Link to="/directory">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="border border-border rounded-xl p-5">
                  <div className="flex gap-4">
                    <Skeleton className="w-14 h-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              displayPartners.slice(0, 6).map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/directory">View all partners <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Become a partner</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Join our directory and connect with thousands of businesses looking for expert help.
          </p>
          <Button asChild className="mt-6 rounded-full px-8" size="lg">
            <Link to="/become-a-partner">Get started</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">PD</span>
                </div>
                <span className="font-heading font-bold text-white">Partners Directory</span>
              </div>
              <p className="text-sm leading-relaxed">Find the right partner for your business needs.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/directory" className="hover:text-white transition-colors">All Partners</Link></li>
                <li><Link to="/directory?category=marketing_and_sales" className="hover:text-white transition-colors">Marketing & Sales</Link></li>
                <li><Link to="/directory?category=development_and_troubleshooting" className="hover:text-white transition-colors">Development</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Log in</Link></li>
                <li><Link to="/become-a-partner" className="hover:text-white transition-colors">Become a Partner</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40">
            © {new Date().getFullYear()} Partners Directory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}