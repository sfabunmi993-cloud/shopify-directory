import { Store, Palette, Code, Wrench, Gauge, Package } from 'lucide-react';

export const SERVICES = [
  {
    id: 'store-build-redesign',
    icon: Store,
    title: 'Store build or redesign',
    short: 'Set up a new Shopify store or redesign an existing one with options ranging from basic theme setup to custom solutions.',
    category: 'store_setup_and_management',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'A well-built store is the foundation of every successful Shopify business. Whether you are launching a brand new store or giving an existing one a fresh look, our partners handle everything from theme installation and layout design to product setup and checkout optimization — so you can launch with confidence.',
    includes: [
      'New store setup from scratch',
      'Theme selection and installation',
      'Storefront layout and page design',
      'Product and collection organization',
      'Navigation and menu structure',
      'Checkout and cart optimization'
    ],
    deliverables: [
      'A fully functional Shopify storefront',
      'Responsive design for mobile and desktop',
      'Optimized product pages and collections',
      'Clean navigation and user flow'
    ],
    faq: [
      { q: 'How long does a store build take?', a: 'Most store builds are completed within 1–3 weeks depending on complexity and the number of products.' },
      { q: 'Can you redesign my existing store?', a: 'Yes. Partners can refresh your current design while preserving your products, orders, and customer data.' },
      { q: 'Do I keep ownership of the store?', a: 'Absolutely — the store is always built on your own Shopify account and you retain full ownership.' }
    ]
  },
  {
    id: 'theme-customization',
    icon: Palette,
    title: 'Theme customization',
    short: 'Create custom pages and forms to personalize how customers discover and purchase your products.',
    category: 'store_setup_and_management',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'Make your store truly yours. Partners customize your theme to match your brand — tweaking colors, typography, layouts, and building custom pages and forms that guide shoppers from discovery to purchase.',
    includes: [
      'Brand colors and typography setup',
      'Custom page templates',
      'Contact and inquiry forms',
      'Header, footer, and announcement bars',
      'Product page layout adjustments',
      'Mobile responsiveness tuning'
    ],
    deliverables: [
      'A theme tailored to your brand identity',
      'Custom landing and product pages',
      'Working forms for customer engagement',
      'Consistent mobile and desktop experience'
    ],
    faq: [
      { q: 'Will customization break theme updates?', a: 'Partners follow best practices to keep customizations compatible with future theme updates.' },
      { q: 'Can you build custom sections?', a: 'Yes — partners can create reusable custom sections you can reuse across pages.' },
      { q: 'Do you work with any theme?', a: 'Most Shopify themes are supported, including free and premium themes from the Theme Store.' }
    ]
  },
  {
    id: 'custom-app-integrations',
    icon: Code,
    title: 'Custom app integrations',
    short: 'Add features and functionality to your store that require custom code, a custom-built app, or connecting to other systems.',
    category: 'development_and_troubleshooting',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'When off-the-shelf apps aren\'t enough, partners build custom solutions. From connecting your store to external systems and APIs to building a private app tailored to your workflow, they bring the exact functionality you need.',
    includes: [
      'Third-party API integrations',
      'Custom-built Shopify apps',
      'ERP, CRM, and inventory syncing',
      'Marketing and analytics integrations',
      'Custom checkout and cart logic',
      'Automation scripts and workflows'
    ],
    deliverables: [
      'A working integration or custom app',
      'Documentation and setup guidance',
      'Tested and secure data flows',
      'Ongoing support where agreed'
    ],
    faq: [
      { q: 'Do I need a custom app or can I use existing apps?', a: 'Partners will assess your needs and recommend existing apps first, building custom only when required.' },
      { q: 'Will the integration be secure?', a: 'Yes — partners follow Shopify\'s security best practices and use authenticated APIs.' },
      { q: 'Can you integrate with my existing tools?', a: 'Most systems with an API can be connected. Share your tools during the inquiry.' }
    ]
  },
  {
    id: 'troubleshooting',
    icon: Wrench,
    title: 'Troubleshooting',
    short: 'Resolve any errors or issues in your store.',
    category: 'development_and_troubleshooting',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'When something breaks, you need it fixed fast. Partners diagnose and resolve errors — from broken pages and checkout glitches to app conflicts and performance issues — getting your store back to running smoothly.',
    includes: [
      'Error and bug diagnosis',
      'Checkout and payment issue fixes',
      'Broken layout and theme fixes',
      'App conflict resolution',
      'Performance and speed fixes',
      'Store recovery and backups'
    ],
    deliverables: [
      'A clear diagnosis of the issue',
      'Working fix applied to your store',
      'Recommendations to prevent recurrence',
      'Brief summary of changes made'
    ],
    faq: [
      { q: 'How fast can issues be resolved?', a: 'Many issues are resolved within 24–48 hours; complex bugs may take longer depending on the cause.' },
      { q: 'Will troubleshooting affect my live store?', a: 'Partners minimize disruption and test fixes before applying them to your live store.' },
      { q: 'Can you fix issues caused by third-party apps?', a: 'Yes — partners can identify app conflicts and recommend fixes or alternatives.' }
    ]
  },
  {
    id: 'website-audit-optimization',
    icon: Gauge,
    title: 'Website audit and optimization strategy',
    short: "Improve your site's overall performance with a comprehensive website audit.",
    category: 'store_setup_and_management',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'Find out exactly what\'s holding your store back. Partners audit your store\'s performance, speed, SEO, and user experience, then deliver a prioritized optimization plan to boost conversions and grow sales.',
    includes: [
      'Performance and speed audit',
      'SEO and content review',
      'User experience (UX) analysis',
      'Conversion funnel review',
      'Mobile experience audit',
      'Prioritized action plan'
    ],
    deliverables: [
      'A detailed audit report',
      'Prioritized list of improvements',
      'Speed and SEO recommendations',
      'A roadmap to lift conversions'
    ],
    faq: [
      { q: 'How long does an audit take?', a: 'Most audits are delivered within 3–5 business days.' },
      { q: 'Will you implement the fixes too?', a: 'The audit is the strategy; partners can be hired separately to implement the recommended changes.' },
      { q: 'Do you need access to my store?', a: 'Partners may request collaborator access to review settings and theme code.' }
    ]
  },
  {
    id: 'product-collection-setup',
    icon: Package,
    title: 'Product and collection setup',
    short: 'Set up your products with images and descriptions, or offer custom options like subscriptions and gift cards.',
    category: 'store_setup_and_management',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=607&h=227&q=80',
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&h=500&q=80',
    overview: 'Great products deserve great presentation. Partners set up your products with optimized images, descriptions, and variants — and can configure subscriptions, gift cards, and custom options that expand how customers buy.',
    includes: [
      'Product import and organization',
      'Image optimization and alt text',
      'Descriptions and SEO metafields',
      'Variants and pricing setup',
      'Collections and smart grouping',
      'Subscriptions and gift card setup'
    ],
    deliverables: [
      'A clean, organized product catalog',
      'Optimized images and descriptions',
      'Collections that guide shopping',
      'Custom options configured (where needed)'
    ],
    faq: [
      { q: 'Can you migrate products from another platform?', a: 'Yes — partners can import products from CSV, other platforms, or supplier feeds.' },
      { q: 'Do you write product descriptions?', a: 'Partners can write or refine descriptions to improve clarity and SEO.' },
      { q: 'Can you set up subscriptions?', a: 'Yes, partners configure subscription products using Shopify\'s subscription APIs or compatible apps.' }
    ]
  }
];

export const getService = (id) => SERVICES.find((s) => s.id === id);