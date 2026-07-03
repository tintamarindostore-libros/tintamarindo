import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return [
    { url: base,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/faq`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terminos`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/arrepentimiento`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
