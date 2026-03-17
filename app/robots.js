export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/wallet', '/orders', '/order/', '/profile', '/demand/'],
      },
    ],
    sitemap: 'https://pellettrade.vercel.app/sitemap.xml',
  };
}
