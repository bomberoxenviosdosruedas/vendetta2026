import { MetadataRoute } from 'next'
 
const URL = 'https://vendettadashboardredis.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${URL}/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
        url: `${URL}/admin`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
    },
    {
        url: `${URL}/overview`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
    },
  ]
}