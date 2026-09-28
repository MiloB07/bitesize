import { useLayoutEffect, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import { transitionFrom } from './lib/sectionTransition.js'
import { SECTIONS } from './sections.js'
import WorldMap from './world/WorldMap.jsx'
import './App.css'

// Placeholder until there are real accounts
const currentUser = { firstName: 'Kaaveh', lastName: 'DaGoat' }

function App() {
  // null means the home screen
  const [activeSection, setActiveSection] = useState(null)

  // The page theme lives on <html> so the body background can change too
  useLayoutEffect(() => {
    if (activeSection) {
      document.documentElement.dataset.section = activeSection
    } else {
      delete document.documentElement.dataset.section
    }
  }, [activeSection])

  function navigate(sectionId, originEl) {
    if (sectionId === activeSection) return
    transitionFrom(originEl, () => setActiveSection(sectionId))
  }

  const section = SECTIONS.find((s) => s.id === activeSection)

  return (
    <>
      <TopBar
        user={currentUser}
        activeSection={activeSection}
        onNavigate={navigate}
      />
      {activeSection === 'world-map' ? (
        <main className="content content--map">
          <WorldMap />
        </main>
      ) : (
        <main className="content">
          {/* Placeholder for where each screen's content will go */}
          <div className="placeholder-card">
            {section ? (
              <>
                <h2>{section.label}</h2>
                <p>This section is coming soon.</p>
              </>
            ) : (
              <>
                <h2>Your first bite goes here</h2>
                <p>Small cards, a couple of minutes at a time.</p>
              </>
            )}
          </div>
        </main>
      )}
    </>
  )
}

export default App
