import { el } from '../../utils/dom'
import { icon } from '../../utils/icons'
import type { AppState } from '../../types'

export interface SettingsCallbacks {
  onChangeAccent: (color: string) => void
  onChangeBlur: (enabled: boolean) => void
  onChangeParallax: (enabled: boolean) => void
  onClose: () => void
}

export function SettingsPanel(
  state: AppState,
  callbacks: SettingsCallbacks,
): HTMLElement {
  const overlay = el('div', { class: 'settings-overlay', role: 'dialog', 'aria-label': 'Settings' })
  const panel = el('div', { class: 'settings-panel' })

  const header = el('div', { class: 'settings-header' })
  header.innerHTML = `${icon('settings', 20)} Settings`
  const closeBtn = el('button', { class: 'navbar-btn-icon', title: 'Close' })
  closeBtn.innerHTML = icon('x')
  closeBtn.addEventListener('click', () => callbacks.onClose())
  header.appendChild(closeBtn)
  panel.appendChild(header)

  const accentGroup = el('div', { class: 'settings-group' })
  accentGroup.appendChild(el('div', { class: 'settings-group-title' }, 'Accent Color'))
  const picker = el('div', { class: 'accent-picker' })
  const colors: Record<string, string> = {
    blossom: '#f7b3ef',
    lilac: '#c9a7f5',
    sky: '#a8c7fa',
    sage: '#b8d1a8',
    gold: '#d2d389',
    rose: '#f4a7b9',
  }
  Object.entries(colors).forEach(([name, hex]) => {
    const swatch = el('div', {
      class: `accent-swatch${state.accentColor === name ? ' active' : ''}`,
      style: `background:${hex}`,
      title: name.charAt(0).toUpperCase() + name.slice(1),
    }) as HTMLElement
    swatch.addEventListener('click', () => callbacks.onChangeAccent(name))
    picker.appendChild(swatch)
  })
  accentGroup.appendChild(picker)
  panel.appendChild(accentGroup)

  const appearanceGroup = el('div', { class: 'settings-group' })
  appearanceGroup.appendChild(el('div', { class: 'settings-group-title' }, 'Appearance'))

  const blurRow = el('div', { class: 'settings-row' })
  blurRow.appendChild(el('span', { class: 'settings-row-label' }, 'Blur Effects'))
  const blurToggle = el('div', { class: `settings-toggle${state.blurEnabled ? ' active' : ''}` })
  blurToggle.addEventListener('click', () => callbacks.onChangeBlur(!state.blurEnabled))
  blurRow.appendChild(blurToggle)
  appearanceGroup.appendChild(blurRow)

  const parallaxRow = el('div', { class: 'settings-row' })
  parallaxRow.appendChild(el('span', { class: 'settings-row-label' }, 'Parallax Background'))
  const parallaxToggle = el('div', { class: `settings-toggle${state.parallaxEnabled ? ' active' : ''}` })
  parallaxToggle.addEventListener('click', () => callbacks.onChangeParallax(!state.parallaxEnabled))
  parallaxRow.appendChild(parallaxToggle)
  appearanceGroup.appendChild(parallaxRow)

  panel.appendChild(appearanceGroup)

  overlay.appendChild(panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) callbacks.onClose()
  })

  return overlay
}
