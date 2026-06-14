import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Youtube, Instagram, TrendingUp, Linkedin } from 'lucide-react';

const ShopifyBag = () => (
  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.002-.028.15a.806.806 0 0 1-.795.68h-2.89a.59.59 0 0 1-.584-.678l2.502-15.876a.816.816 0 0 1 .806-.68h3.02c2.3 0 3.876.502 4.627 1.395z"/>
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
              <TrendingUp className="w-5 h-5" />
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