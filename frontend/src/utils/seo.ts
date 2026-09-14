interface SeoOptions {
  title: string
  description?: string
  image?: string
  url?: string
}

export function setPageSeo({ title, description, image, url }: SeoOptions) {
  document.title = title

  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  if (description) {
    setMeta('description', description)
    setMeta('og:description', description, true)
    setMeta('twitter:description', description)
  }

  setMeta('og:title', title, true)
  setMeta('twitter:title', title)

  if (image) {
    setMeta('og:image', image, true)
    setMeta('twitter:image', image)
  }

  if (url) {
    setMeta('og:url', url, true)
  }
}
