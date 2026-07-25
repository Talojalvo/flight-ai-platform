import { useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../components/SceneBackground'
import { ScenePosition } from '../components/ScenePosition'
import { PixelSprite } from '../components/PixelSprite'
import { PromptCard } from '../components/PromptCard'
import { SummaryPanel } from '../components/SummaryPanel'
import { BackButton } from '../components/BackButton'
import { ONBOARDING_ASSETS } from '../assets'
import { useTripPlan } from '../../../state/TripPlanContext'
import { isOnboardingComplete } from '../../../api/mapTripPlanRequest'

type Phase = 'landing' | 'summary'

const PLANE_WIDTH = 'clamp(200px, 26vw, 520px)'

interface Scene4LandingProps {
  onSearch: () => void
  onBack: () => void
}

export function Scene4Landing({ onSearch, onBack }: Scene4LandingProps) {
  const { state } = useTripPlan()
  const [phase, setPhase] = useState<Phase>('landing')

  const readyToSearch = isOnboardingComplete(state)

  return (
    <motion.div className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <SceneBackground src={ONBOARDING_ASSETS.airportMorning}>
        <ScenePosition left="50%" bottom="8%" widthPx={PLANE_WIDTH} zIndex={2}>
          <PixelSprite
            src={ONBOARDING_ASSETS.planeLanded}
            alt="Airplane landing"
            widthPx={PLANE_WIDTH}
            initial={{ y: '-55vh', scale: 0.22, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            onAnimationComplete={() => setPhase('summary')}
          />
        </ScenePosition>

        {phase === 'summary' && (
          <PromptCard title="Review your trip">
            <SummaryPanel state={state} />

            <div className="button-row">
              <BackButton onClick={onBack} />
              <button type="button" className="primary-button" disabled={!readyToSearch} onClick={onSearch}>
                Search Flights
              </button>
            </div>
          </PromptCard>
        )}
      </SceneBackground>
    </motion.div>
  )
}
