import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';

const ShopifyBag = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
    <path d="M15.337 5.24c-.07-.52-.51-.91-1.04-.91h-1.56c-.17-1.06-1.08-1.87-2.18-1.87s-2.01.81-2.18 1.87H6.8c-.53 0-.97.39-1.04.91L4.5 18.24c-.04.29.06.58.26.8.2.21.48.34.78.34h11.91c.3 0 .58-.13.78-.34.2-.22.3-.51.26-.8L17.33 5.24zM10.557 4.33c.26-.31.64-.51 1.07-.51s.81.2 1.07.51c.19.22.31.5.34.8h-2.82c.03-.3.15-.58.34-.8zM7.82 17.18l.96-9.94h6.45l.96 9.94H7.82z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-16 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Logo and 4 Columns */}
        <div className="flex gap-16 mb-16">
          <div className="shrink-0">
            <ShopifyBag />
          </div>

          <div className="grid grid-cols-4 gap-12 flex-1">
            {/* Shopify */}
            <div>
              <h3 className="text-white font-semibold text-base mb-6">Shopify</h3>
              <ul className="space-y-4 text-sm">
                <li><a href="https://www.shopify.com/what-is-shopify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">What is Shopify?</a></li>
                <li><a href="https://www.shopify.com/editions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shopify Editions</a></li>
                <li><a href="https://www.shopify.com/careers" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="https://www.shopify.com/investors" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Investors</a></li>
                <li><a href="https://news.shopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Newsroom</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div>
              <h3 className="text-white font-semibold text-base mb-6">Ecosystem</h3>
              <ul className="space-y-4 text-sm">
                <li><a href="https://shopify.dev/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Developer Docs</a></li>
                <li><a href="https://themes.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Theme Store</a></li>
                <li><a href="https://apps.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">App Store</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Affiliates</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold text-base mb-6">Resources</h3>
              <ul className="space-y-4 text-sm">
                <li><a href="https://www.shopify.com/blog" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="https://www.shopify.com/compare" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Compare Shopify</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="https://www.shopifyacademy.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="https://www.shopify.com/tools" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Free Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold text-base mb-6">Support</h3>
              <ul className="space-y-4 text-sm">
                <li><a href="https://help.shopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shopify Help Center</a></li>
                <li><a href="https://community.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Community Forum</a></li>
                <li><Link to="/directory" className="hover:text-white transition-colors">Hire a Partner</Link></li>
                <li><a href="https://shopifystatus.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Service Status</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <button className="hover:text-white transition-colors flex items-center gap-2">
              🌐 USA | English
            </button>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Legal</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            <a href="#" className="hover:text-white transition-colors">Your Privacy Choices 🔒</a>
          </div>

          <div className="flex gap-4 justify-center">
            <a href="https://www.facebook.com/shopify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/shopify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.youtube.com/user/shopify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/shopify/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.tiktok.com/@shopify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.88a8.27 8.27 0 0 0 4.84 1.56V7.01a4.85 4.85 0 0 1-1.07-.32z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/shopify" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:opacity-80 transition-opacity">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}