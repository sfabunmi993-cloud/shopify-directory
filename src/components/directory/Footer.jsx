import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Shopify */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Shopify</h3>
            <ul className="space-y-4">
              <li><a href="https://www.shopify.com/what-is-shopify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">What is Shopify?</a></li>
              <li><a href="https://www.shopify.com/editions" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shopify Editions</a></li>
              <li><a href="https://www.shopify.com/careers" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="https://www.shopify.com/investors" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="https://news.shopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Newsroom</a></li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Ecosystem</h3>
            <ul className="space-y-4">
              <li><a href="https://shopify.dev/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Developer Docs</a></li>
              <li><a href="https://themes.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Theme Store</a></li>
              <li><a href="https://apps.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">App Store</a></li>
              <li><Link to="/directory" className="hover:text-white transition-colors">Partners Directory</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><a href="https://www.shopify.com/blog" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="https://www.shopify.com/compare" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Compare Shopify</a></li>
              <li><a href="https://www.shopifyacademy.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Courses</a></li>
              <li><a href="https://www.shopify.com/tools" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Free Tools</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="https://help.shopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="https://community.shopify.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Community Forum</a></li>
              <li><Link to="/directory" className="hover:text-white transition-colors">Hire a Partner</Link></li>
              <li><a href="https://shopifystatus.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Service Status</a></li>
            </ul>
          </div>

          {/* Directory */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Directory</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/directory" className="hover:text-white transition-colors">Browse Partners</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
            <ul className="flex flex-col sm:flex-row gap-6 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>

            <div className="flex gap-4">
              <a href="https://www.facebook.com/shopify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="https://twitter.com/shopify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/company/shopify" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/shopify/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-8">© {new Date().getFullYear()} Shopify Partners Directory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}