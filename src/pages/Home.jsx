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
  const { data: displayPartners, isLoading: loading } = useQuery({
    queryKey: ['verified-partners'],
    queryFn: () => base44.entities.Partner.filter({ is_verified: true }, '-rating', 50),
    initialData: []
  });

  return (
    <div>
      <HeroSection />

      {/* Stats */}
      <section className="border-y border-border bg-background">
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
      <section className="<!DOCTYPE html> <html lang=\"en\"> <head> <meta charset=\"utf-8\"/> <link href=\"https://media.base44.com/images/public/6a452a4ab030f47fe0c3ec4f/29eaaefeb_logo.png\" rel=\"icon\" type=\"image/svg+xml\"/> content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover\" name=\"viewport\"/> href=\"/manifest.json\" rel=\"manifest\"/> content=\"#059669\" name=\"theme-color\"/> content=\"The premier professional marketplace to discover, vet, and hire top-tier Shopify developers, designers, e-commerce strategists scale your store.\" name=\"description\"/> content=\"shopify experts, shopify expert, marketplace, ecommerce development, plus, joseph uprising, SEO\" name=\"keywords\"/> content=\"Shopify Expert Hub\" name=\"author\"/> content=\"index, follow\" name=\"robots\"/> content=\"website\" property=\"og:type\"/> property=\"og:title\"/> property=\"og:description\"/> content=\"https://media.base44.com/images/public/6a452a4ab030f47fe0c3ec4f/29eaaefeb_logo.png/v1/fill/w_1200,h_630/29eaaefeb_logo.png\" property=\"og:image\"/> content=\"summary_large_image\" name=\"twitter:card\"/> name=\"twitter:title\"/> name=\"twitter:description\"/> href=\"https://fonts.googleapis.com\" rel=\"preconnect\"/> crossorigin=\"\" href=\"https://fonts.gstatic.com\" href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap\" rel=\"stylesheet\"/> <title> Hub </title> <script src=\"/assets/index-Cy4TNELY.js\" type=\"module\"> </script> href=\"/assets/index-BRtW1W_a.css\" if (window.self === window.top) { let lastPath = \"\"; function getPageNameFromPath(path) const segments path.split(\"/\").filter(Boolean); return segments[0] || null; } trackPageView() path window.location.pathname; (path === lastPath) return; path; pageName \"home\"; appId \"6a452a4ab030f47fe0c3ec4f\"; (!appId) fetch(`/api/app-logs/${appId}/log-user-in-app/${pageName}`, {\n      method: \"POST\",\n    }).catch(() => {}); originalPushState history.pushState.bind(history); history.pushState (...args) originalPushState(...args); trackPageView(); }; originalReplaceState history.replaceState.bind(history); history.replaceState originalReplaceState(...args); window.addEventListener(\"popstate\", trackPageView); content=\"https://shopifyexperthub.base44.app\" property=\"og:url\"/> property=\"og:site_name\"/> name=\"twitter:image\"/> name=\"twitter:url\"/> content=\"yes\" name=\"mobile-web-app-capable\"/> content=\"black\" name=\"apple-mobile-web-app-status-bar-style\"/> name=\"apple-mobile-web-app-title\"/> href=\"https://shopifyexperthub.base44.app\" rel=\"canonical\"/> data-seo-source=\"builder\" type=\"application/ld+json\"> {\"name\": \"Shopify Hub\", \"@context\": \"https://schema.org\", \"@type\": \"WebSite\", \"url\": \"https://shopifyexperthub.base44.app\"} \"logo\": \"https://media.base44.com/images/public/6a452a4ab030f47fe0c3ec4f/29eaaefeb_logo.png\", \"Organization\", async=\"true\" data-app-id=\"6a452a4ab030f47fe0c3ec4f\" data-platform-url=\"https://app.base44.com\" src=\"/static/js/badge.js\"> </head> <body> <div id=\"root\"> id=\"seo-snapshot\" style=\"position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;\"> <main> <header> <h1> </h1> <p> The store. </p> </header> <nav aria-label=\"Pages\"> <h2> Pages </h2> <ul> <li> <a href=\"/admin\"> Admin Dashboard </a> \u2014 on Hub. Shopify. </li> href=\"/expert-dashboard\"> href=\"/client-dashboard\"> Client href=\"/messages\"> Messages href=\"/reset-password\"> Reset Password href=\"/forgot-password\"> Forgot href=\"/login\"> Login href=\"/become-expert\"> Become href=\"/directory\"> Directory href=\"/register\"> Register href=\"/ExpertProfile\"> Profile href=\"/help\"> Help Center href=\"/policies\"> Policies href=\"/success-stories\"> Success Stories href=\"/about\"> About href=\"/leaderboard\"> Leaderboard href=\"/settings\"> Settings href=\"/portfolio\"> Portfolio </ul> </nav> </main> </div> </body> </html>">
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
            {loading ?
            Array(4).fill(0).map((_, i) =>
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
            ) :

            displayPartners.slice(0, 6).map((partner) =>
            <PartnerCard key={partner.id} partner={partner} />
            )
            }
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/directory">View all partners <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      









      

      {/* Footer */}
      <footer className="text-primary-foreground/70 py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="https://cdn.shopify.com/b/shopify-brochure2-assets/08b278c519512d187520e1fe10b4f5b7.svg" alt="Shopify" className="h-7 mt-4 mr-3" />
                
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
    </div>);

}