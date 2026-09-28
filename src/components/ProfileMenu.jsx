import { useEffect, useRef, useState } from 'react'
import DuckAvatar from './DuckAvatar.jsx'
import './ProfileMenu.css'

const MENU_OPTIONS = ['Profile', 'Settings', 'Privacy', 'Help']

function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)

  // Close when clicking outside the menu or pressing Escape
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!wrapperRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="profile-menu" ref={wrapperRef}>
      <button
        type="button"
        ref={buttonRef}
        className="profile-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="profile-menu__avatar">
          <DuckAvatar size={40} />
        </span>
        <span className="profile-menu__name">
          <span className="profile-menu__first-name">{user.firstName}</span>
          <span className="profile-menu__last-name">{user.lastName}</span>
        </span>
      </button>

      <ul
        className="profile-menu__list"
        role="menu"
        data-open={open}
        inert={!open}
      >
        {MENU_OPTIONS.map((option) => (
          <li key={option} role="none">
            <button
              type="button"
              role="menuitem"
              className="profile-menu__item"
              // Options don't go anywhere yet; they just close the menu
              onClick={() => setOpen(false)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProfileMenu
