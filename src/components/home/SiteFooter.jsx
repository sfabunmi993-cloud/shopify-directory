import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';

const COLUMNS = [
{
  title: 'Shopify',
  links: [
  { label: 'What is Shopify?', href: 'https://www.shopify.com/blog/what-is-shopify' },
  { label: 'Shopify Editions', href: 'https://www.shopify.com/editions' },
  { label: 'Careers', href: 'https://www.shopify.com/careers' },
  { label: 'Investors', href: 'https://www.shopify.com/investors' },
  { label: 'Newsroom', href: 'https://www.shopify.com/news' },
  { label: 'Sustainability', href: 'https://www.shopify.com/climate' }]
},
{
  title: 'Ecosystem',
  links: [
  { label: 'Developer Docs', href: 'https://shopify.dev/docs' },
  { label: 'Theme Store', href: 'https://themes.shopify.com/' },
  { label: 'App Store', href: 'https://apps.shopify.com/' },
  { label: 'Partners', href: 'https://www.shopify.com/partners' },
  { label: 'Affiliates', href: 'https://www.shopify.com/affiliates' }]
},
{
  title: 'Resources',
  links: [
  { label: 'Blog', href: 'https://www.shopify.com/blog' },
  { label: 'Compare Shopify', href: 'https://www.shopify.com/compare' },
  { label: 'Guides', href: 'https://www.shopify.com/blog/topics/guides' },
  { label: 'Courses', href: 'https://www.shopifyacademy.com' },
  { label: 'Free Tools', href: 'https://www.shopify.com/tools' },
  { label: 'Changelog', href: 'https://changelog.shopify.com' }]
},
{
  title: 'Support',
  links: [
  { label: 'Shopify Help Center', href: 'https://help.shopify.com/en' },
  { label: 'Community Forum', href: 'https://community.shopify.com/' },
  { label: 'Hire a Partner', to: '/directory' },
  { label: 'Service Status', href: 'https://shopifystatus.com' }]
}];


const LEGAL = [
{ label: 'Terms of Service', href: 'https://www.shopify.com/legal/terms' },
{ label: 'Legal', href: 'https://www.shopify.com/legal' },
{ label: 'Privacy Policy', href: 'https://www.shopify.com/legal/privacy' },
{ label: 'Sitemap', href: 'https://www.shopify.com/sitemap' }];


function ShopifyBagLogo({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Shopify">
      <path
        fill="#ffffff"
        d="M23.16 8.94c-.02-.16-.16-.23-.28-.23-.12 0-2.4.05-2.4.05s-1.7-1.66-1.85-1.81c-.15-.15-.45-.11-.57-.07-.01 0-.4.12-1.06.33-.65-1.87-1.79-3.58-3.78-3.58h-.17C9.95 1.6 9.1 1.78 8.6 2.2c-.5.42-.62 1.06-.62 1.06S5.6 1.6 5.4 1.6c-.2 0-.7.6-1.4 1.7-.7 1.1-.7 1.7-.5 1.7.2 0 .4 0 .4 0l1.5.4c-.2.6-.4 1.3-.6 2.1-.4 1.6-.6 3.2-.6 4.8 0 .8.1 1.5.3 2.1.2.6.5 1.1.9 1.5.4.4.9.7 1.5.9.6.2 1.3.3 2 .3.5 0 1-.1 1.5-.2l.1-.1c.3.3.7.5 1.2.6.5.1 1 .1 1.5.1.5 0 1-.1 1.4-.2.4-.1.8-.4 1.1-.7.3-.3.5-.7.7-1.1.2-.4.3-.9.3-1.4 0-.3 0-.6-.1-.9.4-.2.8-.5 1.1-.9.5-.6.8-1.3.9-2.1.1-.8 0-1.6-.3-2.3z"
      />
      <path
        fill="#000000"
        d="M16.4 8.7l-.5 1.6s1.4-.4 1.5-.4c.1 0 .3.1.3.2 0 .1-.4 1.3-.4 1.3s-.1.2-.3.2c-.2 0-1.6-.1-1.6-.1l-.3 1s2.4.1 2.6.1c.2 0 .4.1.4.3 0 .2-.5 1.5-.5 1.5s-.1.2-.3.2c-.2 0-2.2-.2-2.2-.2l-.4 1.3s-.1.3-.4.3c-.3 0-1.2-.1-1.2-.1l.4-1.3s-1.4-.1-1.5-.1c-.1 0-.3-.1-.2-.3 0-.2.4-1.3.4-1.3s.1-.2.3-.2c.2 0 1.5.1 1.5.1l.3-1s-2.3-.2-2.5-.2c-.2 0-.4-.1-.3-.3 0-.2.5-1.6.5-1.6s.1-.2.3-.2c.2 0 1.7.2 1.7.2z"
      />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-black text-[#808080] font-sans py-16 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-12">
          {/* Logo column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <ShopifyBagLogo className="w-9 h-9" />
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) =>
            <div key={col.title}>
              <h3 className="text-base font-semibold mb-5 text-white leading-5">{col.title}</h3>
              <ul className="flex flex-col gap-y-3.5">
                {col.links.map((l) =>
                  l.to ? (
                    <li key={l.label}>
                      <Link to={l.to} className="transition-colors duration-200 hover:text-white text-sm">
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white text-sm">
                        {l.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-wrap lg:flex-nowrap gap-y-6 sm:gap-x-10 sm:items-center border-t border-white/10 pt-8 mt-12">
          <button
            type="button"
            className="bg-transparent inline-flex items-center gap-x-1.5 text-[#E0E0E0] hover:text-white text-sm whitespace-nowrap"
            aria-label="Region Navigation. Current: Nigeria">
            <Globe className="w-4 h-4 shrink-0 fill-white text-white" />
            <span className="truncate">Nigeria | English</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-white" />
          </button>

          <ul className="flex flex-wrap gap-x-8 gap-y-3 max-sm:flex-col max-sm:gap-y-3 md:me-auto">
            {LEGAL.map((l) =>
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white text-sm">
                  {l.label}
                </a>
              </li>
            )}
            <li>
              <a href="https://accounts.shopify.com/lookup?rid=417b6639-6ad1-4d39-9ebf-a116f7db5c72&verify=1786234370-8pe4hOmMSM3dNP5PFl%2BDPOJRDm0eo0BfN51Zq3IpRds%3D" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white text-sm">
                Log in
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}