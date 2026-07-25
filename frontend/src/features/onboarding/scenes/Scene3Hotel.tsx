import { useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../components/SceneBackground'
import { ScenePosition } from '../components/ScenePosition'
import { PixelSprite } from '../components/PixelSprite'
import { FloatingLoop } from '../components/FloatingLoop'
import { CloudLoop } from '../components/CloudLoop'
import { PromptCard } from '../components/PromptCard'
import { ChoiceField } from '../components/ChoiceField'
import { ContinueButton } from '../components/ContinueButton'
import { BackButton } from '../components/BackButton'
import { ONBOARDING_ASSETS } from '../assets'
import { useTripPlan } from '../../../state/TripPlanContext'

type Phase = 'entering' | 'idle' | 'exiting'

const PLANE_WIDTH = 'clamp(200px, 26vw, 520px)'
const CLOUD_WIDTH = 'clamp(220px, 27vw, 560px)'
const ENTER_DURATION = 1.5

const HOTEL_OPTIONS: { label: string; value: boolean }[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

interface Scene3HotelProps {
  onComplete: () => void
  onBack: () => void
  /** Resume already idle with the hotel question showing (entered via Back from Scene4). */
  enterAtEnd?: boolean
}

export function Scene3Hotel({ onComplete, onBack, enterAtEnd = false }: Scene3HotelProps) {
  const { state, dispatch } = useTripPlan()
  const [phase, setPhase] = useState<Phase>(enterAtEnd ? 'idle' : 'entering')
  const [askHotel, setAskHotel] = useState(enterAtEnd)

  const handleHotelChoice = (includeHotel: boolean) => {
    dispatch({ type: 'SET_INCLUDE_HOTEL', includeHotel })
  }

  return (
    <motion.div className="scene" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <SceneBackground src={ONBOARDING_ASSETS.skyMorning}>
        {phase === 'exiting' && (
          <motion.div
            className="scene-crossfade"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${ONBOARDING_ASSETS.airportMorning})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />
        )}

        <ScenePosition left="50%" top="40%" widthPx={CLOUD_WIDTH} zIndex={3}>
          <CloudLoop travelVw={20} durationSeconds={9} direction="ltr" active={phase !== 'exiting'}>
            <PixelSprite src={ONBOARDING_ASSETS.cloudMorning} alt="Cloud" widthPx={CLOUD_WIDTH} />
          </CloudLoop>
        </ScenePosition>

        <ScenePosition left="50%" top="40%" widthPx={PLANE_WIDTH} zIndex={2}>
          {phase === 'idle' ? (
            <FloatingLoop amplitudePx={5} durationSeconds={3.6}>
              <PixelSprite src={ONBOARDING_ASSETS.planeLandingMorning} alt="Airplane" widthPx={PLANE_WIDTH} />
            </FloatingLoop>
          ) : (
            <PixelSprite
              src={ONBOARDING_ASSETS.planeLandingMorning}
              alt="Airplane"
              widthPx={PLANE_WIDTH}
              initial={
                phase === 'entering'
                  ? { x: '45vw', y: '-35vh', scale: 0.5, opacity: 0 }
                  : { x: '60vw', opacity: 0 }
              }
              animate={
                phase === 'exiting' ? { x: '-60vw', opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }
              }
              transition={{ duration: ENTER_DURATION, ease: phase === 'exiting' ? 'easeIn' : 'easeOut' }}
              onAnimationComplete={() => {
                if (phase === 'entering') {
                  setPhase('idle')
                  setAskHotel(true)
                }
                // Give the viewer a beat to see the plane already departing
                // before swapping scenes, instead of cutting straight away
                // the instant the exit animation itself finishes.
                if (phase === 'exiting') setTimeout(onComplete, 500)
              }}
            />
          )}
        </ScenePosition>

        {askHotel && phase === 'idle' && (
          <PromptCard title="Would you like a hotel?">
            <ChoiceField label="" options={HOTEL_OPTIONS} value={state.includeHotel} onSelect={handleHotelChoice} />
            <div className="button-row">
              <BackButton onClick={onBack} />
              <ContinueButton disabled={state.includeHotel === null} onClick={() => setPhase('exiting')} />
            </div>
          </PromptCard>
        )}
      </SceneBackground>
    </motion.div>
  )
}
