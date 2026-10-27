import { el } from '../utils/dom'
import { icon, icons } from '../utils/icons'
import { SiteCard } from '../components/site/SiteCard'
import { pluralize } from '../utils/format'
import { navigate, basePath } from '../utils/router'
import { AnimeClickMe } from '../components/ui/AnimeClickMe'
import type { Site, Category } from '../types'

export function HomePage(sites: Site[], categories: Category[], favIds: string[], recentIds?: Set<string>): HTMLElement {
  const page = el('div', {})

  const hero = el('div', { class: 'hero-minimal animate-fade-in' })
  hero.appendChild(el('p', { class: 'hero-label' }, '// curated anime archive'))
  const heroTitle = el('div', { class: 'hero-title' })
  heroTitle.appendChild(document.createTextNode('Piralib'))
  heroTitle.appendChild(el('span', { class: 'caret', 'aria-hidden': 'true' }))
  hero.appendChild(heroTitle)
  hero.appendChild(el('p', {}, 'A curated index of the best anime resources on the internet.'))
  const meta = el('div', { class: 'hero-meta' })
  meta.appendChild(el('span', {}, `${pluralize(sites.length, 'site')}`))
  meta.appendChild(el('span', {}, `${pluralize(categories.length, 'category')}`))
  hero.appendChild(meta)
  page.appendChild(hero)

  const clickMe = el('div', { style: 'text-align:center;margin-bottom:var(--space-6);' })
  clickMe.appendChild(AnimeClickMe())
  page.appendChild(clickMe)

  const catSection = el('div', { class: 'home-categories animate-fade-in-up' })
  const catTitle = el('h2', { class: 'section-title', style: 'margin-bottom:var(--space-3);' })
  catTitle.innerHTML = `<span class="prompt">01.</span> Browse by Category`
  catSection.appendChild(catTitle)

  const catGrid = el('div', { class: 'category-grid' })
  const catIcons: Record<string, keyof typeof icons> = {
    anime: 'star',
    manga: 'bookmark',
    novels: 'bookmark',
    tokusatsu: 'star',
    comics: 'bookmark',
    software: 'grid3x3',
    music: 'heart',
    tools: 'search',
    misc: 'search',
    art: 'heart',
    games: 'grid3x3',
    nsfw: 'star',
  }
  categories.forEach(cat => {
    const count = sites.filter(s => s.category === cat.id).length
    const iconName = catIcons[cat.id] || 'chevronRight'
    const card = el('div', { class: 'category-card' })
    card.innerHTML = `
      <div class="category-card-icon">${icon(iconName, 22)}</div>
      <div class="category-card-name">${cat.name}</div>
      <div class="category-card-count">${pluralize(count, 'site')}</div>
      <div class="category-card-desc">${cat.description}</div>
    `
    card.addEventListener('click', () => navigate(`/browse?category=${cat.id}`))
    catGrid.appendChild(card)
  })
  catSection.appendChild(catGrid)
  page.appendChild(catSection)

  const sorted = [...sites].sort((a, b) => {
    const aChanged = recentIds?.has(a.id) ?? false
    const bChanged = recentIds?.has(b.id) ?? false
    if (aChanged !== bChanged) return aChanged ? -1 : 1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
  const recent = sorted.slice(0, 6)
  if (recent.length > 0) {
    const recentSection = el('div', { class: 'home-recent animate-fade-in-up' })
    const recentTitle = el('h2', { class: 'section-title', style: 'margin-bottom:var(--space-3);' })
    recentTitle.innerHTML = `<span class="prompt">02.</span> Recent Additions &amp; Updates`
    recentSection.appendChild(recentTitle)
    const grid = el('div', { class: 'site-grid' })
    recent.forEach(s => grid.appendChild(SiteCard(s, favIds.includes(s.id))))
    recentSection.appendChild(grid)
    page.appendChild(recentSection)
  }



  return page
}
