import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../dist')
const indexHtmlPath = path.join(distDir, 'index.html')

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found! Run vite build first.')
  process.exit(1)
}

const baseHtml = fs.readFileSync(indexHtmlPath, 'utf8')

const pages = [
  {
    dir: 'properties',
    url: 'https://aqar-care.vercel.app/properties',
    title: 'عقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري | عقار كير',
    description: 'تصفح أحدث الشقق والأراضي والبيوت والمحلات المتاحة للبيع كاش وتقسيط في المحلة الكبرى ومنشية البكري مع أسعار دقيقة وتفاصيل كاملة على عقار كير.',
    heading: 'عقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري',
    subheading: 'تصفح أحدث الشقق والوحدات السكنية والتجارية والأراضي والمنازل المتاحة للبيع والتقسيط بأفضل الأسعار بالمحلة الكبرى ومنشية البكري.',
    navText: '<a href="/">الصفحة الرئيسية</a> | <a href="/map">الخريطة التفاعلية</a>'
  },
  {
    dir: 'map',
    url: 'https://aqar-care.vercel.app/map',
    title: 'خريطة عقارات منشية البكري التفاعلية | عقار كير',
    description: 'استكشف الوحدات السكنية والتجارية جغرافياً على خريطة منشية البكري والمحلة الكبرى التفاعلية مع تفاصيل الأسعار وحالة الحجز والبيع على عقار كير.',
    heading: 'خريطة عقارات منشية البكري والمحلة الكبرى التفاعلية',
    subheading: 'استكشف الوحدات السكنية والتجارية والأراضي جغرافياً على خريطة تفاعلية دقيقة مع إمكانية التصفية المباشرة وحجز المعاينات.',
    navText: '<a href="/">الصفحة الرئيسية</a> | <a href="/properties">قائمة العقارات</a>'
  }
]

for (const page of pages) {
  const targetDir = path.join(distDir, page.dir)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  let html = baseHtml

  // Update Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)

  // Update Canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
    `<link rel="canonical" href="${page.url}" />`
  )

  // Update Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
    `<meta name="description" content="${page.description}" />`
  )

  // Update Open Graph
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
    `<meta property="og:url" content="${page.url}" />`
  )
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
    `<meta property="og:title" content="${page.title}" />`
  )
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
    `<meta property="og:description" content="${page.description}" />`
  )

  // Update Twitter
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/,
    `<meta name="twitter:title" content="${page.title}" />`
  )
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/,
    `<meta name="twitter:description" content="${page.description}" />`
  )

  // Inject crawlable fallback inside #root for search engines (replaced when React hydrates)
  const crawlableFallback = `
    <div style="font-family: 'Cairo', sans-serif; padding: 2rem 1rem; max-width: 900px; margin: 0 auto; text-align: center; direction: rtl;">
      <h1 style="font-size: 1.8rem; color: #1e293b; margin-bottom: 1rem;">${page.heading}</h1>
      <p style="font-size: 1.1rem; color: #475569; line-height: 1.8; margin-bottom: 1.5rem;">${page.subheading}</p>
      <div style="margin-top: 1rem; font-size: 1rem;">
        ${page.navText}
      </div>
    </div>
  `

  html = html.replace('<div id="root"></div>', `<div id="root">${crawlableFallback}</div>`)

  const outFilePath = path.join(targetDir, 'index.html')
  fs.writeFileSync(outFilePath, html, 'utf8')
  console.log(`Generated static SEO page: ${outFilePath}`)
}

// Also enhance dist/index.html (homepage) with crawlable semantic internal links
const homeFallback = `
  <div style="font-family: 'Cairo', sans-serif; padding: 2rem 1rem; max-width: 900px; margin: 0 auto; text-align: center; direction: rtl;">
    <h1 style="font-size: 1.8rem; color: #1e293b; margin-bottom: 1rem;">عقار كير | شقق وعقارات للبيع والإيجار بالمحلة الكبرى ومنشية البكري</h1>
    <p style="font-size: 1.1rem; color: #475569; line-height: 1.8; margin-bottom: 1.5rem;">منصة عقار كير - بوابتك العقارية الأولى للبحث عن شقق ووحدات سكنية وتجارية للبيع والإيجار بالمحلة الكبرى ومنشية البكري بأفضل الأسعار كاش وتقسيط مع خريطة تفاعلية.</p>
    <div style="margin-top: 1rem; font-size: 1.05rem;">
      <a href="/properties" style="margin: 0 10px; font-weight: bold; color: #b77a3d;">تصفح كل العقارات المتاحة</a> | 
      <a href="/map" style="margin: 0 10px; font-weight: bold; color: #2d4a3e;">استكشف الخريطة التفاعلية</a>
    </div>
  </div>
`
const updatedHomeHtml = baseHtml.replace('<div id="root"></div>', `<div id="root">${homeFallback}</div>`)
fs.writeFileSync(indexHtmlPath, updatedHomeHtml, 'utf8')
console.log('Enhanced dist/index.html with crawlable internal links.')

console.log('Static SEO page generation completed successfully.')

