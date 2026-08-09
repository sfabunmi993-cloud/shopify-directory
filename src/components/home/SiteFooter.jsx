import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown, ArrowUp } from 'lucide-react';

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


const SOCIAL = [
{ label: 'Facebook', href: 'https://www.facebook.com/shopify' },
{ label: 'Twitter', href: 'https://twitter.com/shopify' },
{ label: 'YouTube', href: 'https://www.youtube.com/user/shopify' },
{ label: 'Instagram', href: 'https://www.instagram.com/shopify/' },
{ label: 'TikTok', href: 'https://www.tiktok.com/@shopify' },
{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/shopify' },
{ label: 'Pinterest', href: 'https://www.pinterest.com/shopify/' }];


export default function SiteFooter() {
  return (
    <footer className="relative bg-black text-[#a1a1aa] font-sans py-16 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-y-12 sm:grid-cols-3 sm:gap-x-8 mx-1">
          {/* Logo / back to top */}
          


          

          {/* Link columns */}
          <ul className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
            {COLUMNS.map((col) =>
            <li key={col.title}>
                <h3 className="text-xl font-medium mb-5 text-white leading-5">{col.title}</h3>
                <ul className="flex flex-col gap-y-3.5">
                  {col.links.map((l) =>
                l.to ?
                <li key={l.label}>
                        <Link to={l.to} className="transition-colors duration-200 hover:text-white text-sm">
                          {l.label}
                        </Link>
                      </li> :

                <li key={l.label}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white text-sm">
                          {l.label}
                        </a>
                      </li>

                )}
                </ul>
              </li>
            )}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-wrap lg:flex-nowrap gap-y-6 sm:gap-x-10 sm:items-center border-t border-[#121C1E] pt-8 mt-10">
          {/* Region selector (static) */}
          <button
            type="button"
            className="bg-transparent inline-flex items-center gap-x-1.5 text-[#E0E0E0] hover:text-white text-sm whitespace-nowrap"
            aria-label="Region Navigation. Current: Nigeria">
            <Globe className="w-4 h-4 shrink-0 fill-white text-white" />
            <span className="truncate">Nigeria | English</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-white" />
          </button>

          {/* Legal links */}
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

          {/* Social icons */}
          







          
        </div>
      </div>
    </footer>);

}