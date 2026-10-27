import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import { navigate } from '../../utils/router'
import { Tag } from '../ui/Tag'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { relativeTime, cleanUrl, faviconUrl } from '../../utils/format'
import type { Site, Category } from '../../types'

export function SiteDetail(
  site: Site,
  isFav: boolean,
  note: string,
  onToggleFav: (id: string) => void,
  onSaveNote: (id: string, note: string) => void,
  categories: Category[] = [],
): HTMLElement {
  const container = el('div', { class: 'site-detail' })

  const catMap = new Map(categories.map(c => [c.id, c.name]))
  const subcatMap = new Map(categories.flatMap(c => c.subcategories.map(s => [s.id, s.name])))
  const catName = catMap.get(site.category) || site.category
  const subName = subcatMap.get(site.subcategory) || site.subcategory

  const breadcrumbs = Breadcrumbs([
    { label: 'Home', href: '/' },
    { label: catName, href: `/browse?category=${site.category}` },
    { label: subName, href: `/browse?subcategory=${site.subcategory}` },
    { label: site.name },
  ])
  container.appendChild(breadcrumbs)

  const header = el('div', { class: 'site-detail-header' })
  const info = el('div', { class: 'site-detail-info', style: 'width:100%;' })
  const nameRow = el('div', { class: 'site-detail-name' })
  const detailLogo = el('img', { class: 'site-detail-logo', src: faviconUrl(site.url), alt: '', width: '64', height: '64', loading: 'eager', fetchpriority: 'high' })
  nameRow.appendChild(detailLogo)
  nameRow.appendChild(el('span', {}, site.name))
  info.appendChild(nameRow)

  info.appendChild(el('div', { class: 'site-detail-url' }, cleanUrl(site.url)))

  const actions = el('div', { class: 'site-detail-actions' })
  const visitBtn = el('a', {
    class: 'btn btn-primary',
    href: site.url,
    target: '_blank',
    rel: 'noopener noreferrer',
  })
  visitBtn.innerHTML = `${icon('externalLink')} Visit Site`
  actions.appendChild(visitBtn)

  const copyBtn = el('button', { class: 'btn btn-secondary' }, 'Copy URL')
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(site.url)
    copyBtn.textContent = 'Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy URL' }, 2000)
  })
  actions.appendChild(copyBtn)

  const favBtn = el('button', { class: 'btn btn-ghost' })
  favBtn.innerHTML = isFav ? `${icon('starFilled')} Unfavorite` : `${icon('star')} Favorite`
  favBtn.addEventListener('click', () => { onToggleFav(site.id) })
  actions.appendChild(favBtn)
  info.appendChild(actions)

  info.appendChild(el('p', { class: 'site-detail-desc' }, site.description))

  if (site.curatorNote) {
    const noteBox = el('div', { class: 'curator-note' })
    noteBox.appendChild(el('div', { class: 'curator-note-label' }, 'Curator Note'))
    noteBox.appendChild(document.createTextNode(site.curatorNote))
    info.appendChild(noteBox)
  }

  header.appendChild(info)
  container.appendChild(header)

  const meta = el('div', { class: 'site-detail-meta' })
  const metaFields: Array<{ label: string; value: string }> = [
    { label: 'Category', value: `${catName} / ${subName}` },
    { label: 'Added', value: relativeTime(site.addedAt) },
    { label: 'Updated', value: relativeTime(site.updatedAt) },
    { label: 'Language', value: site.language },
  ]
  if (site.requires !== 'none') metaFields.push({ label: 'Requires', value: site.requires })
  metaFields.forEach(f => {
    const item = el('div', { class: 'meta-item' })
    item.appendChild(el('span', { class: 'meta-label' }, f.label))
    item.appendChild(el('span', { class: 'meta-value' }, f.value))
    meta.appendChild(item)
  })
  container.appendChild(meta)

  const tagsSection = el('div', { style: 'margin-bottom:var(--space-6)' })
  site.tags.forEach(t => tagsSection.appendChild(Tag(t, true)))
  container.appendChild(tagsSection)

  const notesSection = el('div', { class: 'site-detail-notes' })
  notesSection.appendChild(el('label', { class: 'meta-label', style: 'margin-bottom:var(--space-2);display:block;' }, 'Personal Notes (saved to this device)'))
  const textarea = el('textarea', { placeholder: 'Add private notes about this site…' }) as HTMLTextAreaElement
  textarea.value = note
  let noteTimeout: ReturnType<typeof setTimeout>
  textarea.addEventListener('input', () => {
    clearTimeout(noteTimeout)
    noteTimeout = setTimeout(() => onSaveNote(site.id, textarea.value), 500)
  })
  notesSection.appendChild(textarea)
  container.appendChild(notesSection)

  container.appendChild(el('div', { style: 'margin-top:var(--space-4)' },
    (() => { const a = el('a', { href: '#', class: 'section-link' }); a.innerHTML = `${icon('arrowLeft')} Back to Browse`; a.addEventListener('click', (e) => { e.preventDefault(); navigate('/browse') }); return a })()))

  return container
}
