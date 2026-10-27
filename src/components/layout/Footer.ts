import { el } from '../../utils/dom'

export function Footer(siteCount: number): HTMLElement {
  const footer = el('footer', { class: 'footer' })
  const left = el('span', { class: 'footer-brand' })
  left.innerHTML = `<span class="prompt">&gt;_</span> Piralib <span class="dash"></span> ${siteCount} curated sites`
  const links = el('div', { class: 'footer-links' })
  const linkData = [
    { label: 'GitHub ↗', href: 'https://github.com/6bpr/Pirated-Lib' },
    { label: 'back to top ↑', href: '#top' },
  ]
  linkData.forEach(l => {
    const a = el('a', { href: l.href, target: l.href.startsWith('#') ? undefined : '_blank', rel: l.href.startsWith('#') ? undefined : 'noopener' }, l.label)
    if (l.href.startsWith('#')) {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
    links.appendChild(a)
  })
  footer.appendChild(left)
  footer.appendChild(links)
  return footer
}
