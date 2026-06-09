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
    <section className="<html> <head></head> <body class=\"m-4 p-4\"> <section class=\"grid grid-cols-full pb-xl text-section-light-text pt-4xl gap-y-0 bg-transparent\" data-section-name=\"service-hero\" data-component-name=\"partners-service-hero\" data-viewable-component=\"true\" data-mode=\"light\"> <div class=\"container grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-x-gutter items-center pt-xl\"> class=\"col-span-4 xs:col-span-4 sm:col-span-8 md:col-span-6 col-start-1\"> class=\"relative flex flex-col gap-y-md\"> class=\"text-left dir-text-pretty\" data-mode=\"light\" data-component-name=\"heading-group\"> <h1 class=\"richtext text-t3 text-balance\">Find service partners</h1> text-body-base opacity-body pt-2\"> Browse by price, location, services, and more to find a partner that meets your needs.</div> </div> class=\"flex flex-col\"> flex-wrap gap-y-4 gap-x-2\"><a href=\"/ng/partners/directory/services/marketing-and-sales\" class=\"inline-block self-center overflow-hidden max-w-full px-button-px py-button-py ring-inset rounded-button text-button-size font-button-font font-button-weight tracking-button-tracking transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-focus focus-visible:outline hover:ring-1 disabled:hover-ring-0 border-2 text-button-light-secondary-text bg-button-light-secondary-bg border-button-light-secondary-border ring-button-light-secondary-border hover:text-button-light-secondary-text-hover hover:bg-button-light-secondary-bg-hover hover:border-button-light-secondary-border-hover hover:ring-button-light-secondary-border-hover focus:text-button-light-secondary-text-focus focus:bg-button-light-secondary-bg-focus focus:border-button-light-secondary-border-focus focus:ring-button-light-secondary-border-focus active:text-button-light-secondary-text-active active:bg-button-light-secondary-bg-active active:border-button-light-secondary-border-active active:ring-button-light-secondary-border-active disabled:text-button-light-secondary-text-disabled disabled:bg-button-light-secondary-bg-disabled disabled:border-button-light-secondary-border-disabled disabled:ring-button-light-secondary-border-disabled\" data-component-name=\"button\">Marketing sales</a><a href=\"/ng/partners/directory/services/store-setup\" data-component-name=\"button\">Store setup management</a><a href=\"/ng/partners/directory/services/development-and-troubleshooting\" data-component-name=\"button\">Development troubleshooting</a><a href=\"/ng/partners/directory/services/visual-content-and-branding\" data-component-name=\"button\">Visual content branding</a><a href=\"/ng/partners/directory/services/content-writing\" data-component-name=\"button\">Content writing</a><a href=\"/ng/partners/directory/services/expert-guidance\" data-component-name=\"button\">Expert guidance</a></div> col-start-1 hidden md:block\"> <img src=\"https://cdn.shopify.com/b/shopify-brochure2-assets/a7ac407a50f89efe69413cc02a73d700.png?height=363\" srcset=\"https://cdn.shopify.com/b/shopify-brochure2-assets/a7ac407a50f89efe69413cc02a73d700.png?height=363, https://cdn.shopify.com/b/shopify-brochure2-assets/a7ac407a50f89efe69413cc02a73d700.png?height=726 2x\" alt=\"The image features card megaphone illustration. The is green white, the purple. conveys idea of communication, interaction, collaboration, highlighting importance effective communication in various professional contexts.\" class=\"mx-auto\"></div> </section> </body> </html>">
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
                className="inline-flex items-center px-4 py-2.5 rounded-full border border-border bg-white text-sm font-medium text-foreground hover:border-foreground hover:shadow-sm transition-all duration-200">
                
                  {cat.label}
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  <div className="w-28 h-28 rounded-2xl bg-white shadow-lg border border-border/50 flex items-center justify-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face" alt="Partner" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-28 h-28 rounded-2xl bg-white shadow-lg border border-border/50 flex items-center justify-center overflow-hidden mt-6">
                    <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face" alt="Partner" className="w-full h-full object-cover" />
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