// Site-wide constants. Keep this file lean — wider brand identity lives in the ops
// repo's docs/brand.md (rewritten by the Phase 2 design pass).

export const SITE = {
  name: 'RoomTested',
  tagline: 'Home tech, tested in a real room.',
  description:
    'Independent reviews, comparisons and setup guides for smart home and desk gear — every product tested in a real room before we recommend it.',
  url: 'https://roomtested.com',
  locale: 'en-GB',
  defaultAuthor: 'Nicholas Edwards',
  // Flipped to true the day affiliate links go live — renders the per-post
  // disclosure banner site-wide. Until then links are plain (non-affiliate).
  affiliateActive: false,
} as const;

export const CATEGORIES = [
  // Smart home
  { slug: 'security', name: 'Security', description: 'Cameras, doorbells, locks, sensors.' },
  { slug: 'lighting', name: 'Lighting', description: 'Smart bulbs, strips, panels, scene control.' },
  { slug: 'climate-energy', name: 'Climate & Energy', description: 'Thermostats, air quality, energy monitors, portable power.' },
  { slug: 'cleaning-robotics', name: 'Cleaning Robotics', description: 'Robot vacuums, mops and their upkeep.' },
  { slug: 'networking', name: 'Networking', description: 'Mesh WiFi, switches, NAS, home servers.' },
  { slug: 'hubs-protocols', name: 'Hubs & Protocols', description: 'Matter, Thread, Zigbee, Home Assistant.' },
  // Desk & PC
  { slug: 'desk-setup', name: 'Desk Setup', description: 'Desks, mounts, mats, lighting, cable management.' },
  { slug: 'peripherals', name: 'Peripherals', description: 'Keyboards, mice, webcams, USB gear.' },
  { slug: 'monitors', name: 'Monitors & Displays', description: 'Monitors, arms, calibration, KVMs.' },
  { slug: 'audio', name: 'Audio', description: 'Headsets, speakers, microphones, DACs.' },
  { slug: '3d-printing', name: '3D Printing', description: 'FDM and resin printers, materials, upgrades.' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const COLLECTIONS = ['reviews', 'guides', 'comparisons'] as const;
export type CollectionName = (typeof COLLECTIONS)[number];
