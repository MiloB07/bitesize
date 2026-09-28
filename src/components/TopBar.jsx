import { wiggleTab } from '../lib/sectionTransition.js'
import { SECTIONS } from '../sections.js'
import ProfileMenu from './ProfileMenu.jsx'
import './TopBar.css'

function TopBar({ user, activeSection, onNavigate }) {
  function handleTabClick(sectionId, tabEl) {
    if (sectionId === activeSection) return
    wiggleTab(tabEl)
    onNavigate(sectionId, tabEl)
  }

  return (
    <header className="top-bar">
      <button
        type="button"
        className="top-bar__title"
        onClick={(event) => onNavigate(null, event.currentTarget)}
      >
        Welcome To Bitesize!
      </button>

      <nav className="top-bar__sections" aria-label="Sections">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className="top-bar__section"
            style={{ '--section-color': section.color }}
            aria-current={section.id === activeSection ? 'page' : undefined}
            onClick={(event) => handleTabClick(section.id, event.currentTarget)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <ProfileMenu user={user} />
    </header>
  )
}

export default TopBar
