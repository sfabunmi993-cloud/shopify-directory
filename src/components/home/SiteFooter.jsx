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
    <svg viewBox="0 0 20 23" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Shopify">
      <path
        fill="#ffffff"
        d="M13.46 2.27c-.86-.86-2.4-1.2-3.7-.74-.07-.03-.14-.05-.21-.05-.47 0-.95.19-1.4.49-.49.31-.95.49-1.45.49-.5 0-.95-.18-1.45-.49-.45-.3-.94-.49-1.4-.49-.06 0-.13.02-.2.05C4.09.85 3.03 1.7 2.55 3.2 1.83 5.4 1.4 7.86 1.4 10.36c0 1.5.18 3 .39 4.4.31 2.06.79 4.07 1.6 5.97.3.7.69 1.39 1.3 1.88.42.34.94.5 1.5.5.43 0 .85-.14 1.21-.36.36-.22.67-.5 1.01-.7.34-.2.7-.34 1.1-.34.4 0 .76.14 1.1.34.34.2.65.48 1.01.7.36.22.78.36 1.21.36.56 0 1.08-.16 1.5-.5.61-.49 1-1.18 1.3-1.88.81-1.9 1.29-3.91 1.6-5.97.21-1.4.39-2.9.39-4.4 0-2.5-.43-4.96-1.15-7.16z"
      />
      <path
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.42 7.27c.06.06.07.15.05.22-.06.28-.16.59-.26.92-.15.5-.32 1.04-.43 1.6-.05.27.04.55.25.74.2.18.49.23.74.13.5-.2 1.27-.5 1.45-.55.05-.01.1 0 .13.04.03.04.04.09.02.14-.23.65-.86 2.36-1.06 2.6-.18.21-.62.18-1.02.1-.22-.05-.43-.05-.6-.01-.34.08-.6.34-.7.68-.15.5-.04 1.05.28 1.46.32.41.81.63 1.32.57.45-.05.84-.32 1.07-.72.2-.35.28-.76.24-1.16-.01-.13-.04-.26-.07-.38-.03-.12.01-.25.11-.32.1-.07.23-.07.33 0 .1.07.15.2.12.32-.04.16-.07.33-.08.5-.04.55.1 1.1.4 1.55.3.45.77.76 1.3.84.05 0 .1.04.12.09.02.05.01.11-.03.15-.04.04-.1.05-.15.03-.5-.18-.96-.5-1.3-.93-.2-.25-.35-.54-.44-.84-.13.2-.3.38-.5.52-.4.28-.9.4-1.4.32-.5-.08-.95-.35-1.25-.76-.3-.41-.43-.93-.36-1.43.07-.5.34-.95.74-1.25.2-.15.43-.26.67-.32-.1-.2-.15-.43-.14-.66.04-.5.2-1.04.36-1.55.1-.3.2-.6.26-.86.02-.08 0-.16-.06-.22-.06-.06-.14-.08-.22-.05-.4.15-1.1.4-1.5.5-.04.01-.07.05-.07.1z"
      />
      <path
        fill="#000000"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.42 7.27c-.06-.06-.14-.08-.22-.05-.4.15-1.1.4-1.5.5-.08.02-.16 0-.22-.06-.06-.06-.08-.14-.05-.22.06-.26.16-.56.26-.86.16-.51.32-1.05.36-1.55.01-.23-.04-.46-.14-.66-.24.06-.47.17-.67.32-.4.3-.67.75-.74 1.25-.07.5.06 1.02.36 1.43.3.41.75.68 1.25.76.5.08 1-.04 1.4-.32.2-.14.37-.32.5-.52.09.3.24.59.44.84.34.43.8.75 1.3.93.05.02.11.01.15-.03.04-.04.05-.1.03-.15-.02-.05-.07-.09-.12-.09-.53-.08-1-.39-1.3-.84-.3-.45-.44-1-.4-1.55.01-.17.04-.34.08-.5.03-.12-.02-.25-.12-.32-.1-.07-.23-.07-.33 0-.1.07-.14.2-.11.32.03.12.06.25.07.38.04.4-.04.81-.24 1.16-.23.4-.62.67-1.07.72-.51.06-1-.16-1.32-.57-.32-.41-.43-.96-.28-1.46.1-.34.36-.6.7-.68.17-.04.38-.04.6.01.4.08.84.11 1.02-.1.2-.24.83-1.95 1.06-2.6.02-.05.01-.1-.02-.14-.03-.04-.08-.05-.13-.04-.18.05-.95.35-1.45.55-.25.1-.54.05-.74-.13-.21-.19-.3-.47-.25-.74.11-.56.28-1.1.43-1.6.1-.33.2-.64.26-.92.02-.07.01-.16-.05-.22z"
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