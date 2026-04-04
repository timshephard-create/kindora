import type { MetadataRoute } from 'next';
import { PLATFORM, TOOL_LIST } from '@/config/platform';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = PLATFORM.url;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...TOOL_LIST.map((tool) => ({
      url: `${baseUrl}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
