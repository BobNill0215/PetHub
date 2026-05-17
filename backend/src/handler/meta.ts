import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function handleSitemap(_req: Request, res: Response) {
  try {
    const feeds = await prisma.feed.findMany({ where: { isDraft: false }, select: { id: true, updatedAt: true }, take: 1000 });
    const cats = ['cat', 'dog', 'smallpet', 'aquatic', 'reptile', 'insect', 'general'];

    const urls = [
      '<url><loc>https://frontend-production-ae85.up.railway.app</loc><changefreq>daily</changefreq><priority>1.0</priority></url>',
      '<url><loc>https://frontend-production-ae85.up.railway.app/feed</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>',
      ...feeds.map(f => `<url><loc>https://frontend-production-ae85.up.railway.app/post/${f.id}</loc><lastmod>${f.updatedAt.toISOString()}</lastmod><priority>0.7</priority></url>`),
      ...cats.map(c => `<url><loc>https://frontend-production-ae85.up.railway.app/category/${c}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>`),
    ];

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
  } catch { res.status(500).send('Error'); }
}
