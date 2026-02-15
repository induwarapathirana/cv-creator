import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://openresume.top';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/builder',
        '/dashboard',
        '/parser',
    ];

    const currentDate = new Date().toISOString();

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: currentDate,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
