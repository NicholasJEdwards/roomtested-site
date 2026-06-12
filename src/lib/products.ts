import data from '../data/products.json';

export type Store = 'aliexpress' | 'ebay';

export interface ProductLink {
  /** Plain (non-affiliate) product URL — always present. */
  url: string;
  /** Affiliate deep link. Stays null until the AliExpress Portals key is approved;
      swapping it in is a data-only change because all buttons point at /go/<id>. */
  affiliateUrl: string | null;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  links: Partial<Record<Store, ProductLink>>;
  /** Hand-checked "from" price in GBP (never a one-time/new-user promo price). */
  priceFromGBP?: number;
  /** ISO date the price was last hand-checked. */
  priceCheckedAt?: string;
  image?: string;
  specs?: Record<string, string | number | boolean>;
}

const products = (data as { products: Product[] }).products;

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProducts(ids: string[]): Product[] {
  return ids.map(getProduct).filter((p): p is Product => !!p);
}

export const STORE_LABELS: Record<Store, string> = {
  aliexpress: 'AliExpress',
  ebay: 'eBay',
};

/** The URL a /go/ redirect should send the visitor to for this product+store. */
export function resolveTarget(product: Product, store: Store): string | undefined {
  const link = product.links[store];
  return link ? (link.affiliateUrl ?? link.url) : undefined;
}

/** All product links on the site go through this — never raw store URLs in content. */
export function goHref(id: string, store: Store = 'aliexpress'): string {
  return `/go/${id}?to=${store}`;
}

export const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
});
