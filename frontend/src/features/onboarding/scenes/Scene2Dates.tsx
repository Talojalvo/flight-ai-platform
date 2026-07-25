import { useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../components/SceneBackground'
import { ScenePosition } from '../components/ScenePosition'
import { PixelSprite } from '../components/PixelSprite'
import { CloudLoop } from '../components/CloudLoop'
import { PromptCard } from '../components/PromptCard'
import { DateField } from '../components/DateField'
import { ContinueButton } from '../components/ContinueButton'
import { BackButton } from '../components/BackButton'
import { ONBOARDING_ASSETS } from '../assets'
import { useTripPlan } from '../../../state/TripPlanContext'

type Phase = 'entering' | 'idle' | 'exiting'
type Question = 'departure' | 'return'

const PLANE_WIDTH = 'clamp(200px, 26vw, 520px)'
const CLOUD_WIDTH = 'clamp(220px, 27vw, 560px)'
const ENTER_DURATION = 1.5

interface Scene2DatesProps {
  onComplete: () => void
  onBack: () => void
  /** Resume at the return-date question, already idle (entered via Back from Scene3). */
  enterAtEnd?: boolean
}

export function Scene2Dates({ onComplete, onBack, enterAtEnd = false }: Scene2DatesProps) {
  const { state, dispatch } = useTripPlan()
  const [phase, setPhase] = useState<Phase>(enterAtEnd ? 'idle' : 'entering')
  const [question, setQuestion] = useState<Question>(enterAtEnd ? 'return' : 'departure')

  const today = new Date().toISOString().slice(0, 10)

  const handleDepartureDate = (date: string) => {
    dispatch({ type: 'SET_DEPARTURE_DATE', date })
  }

  const handleReturnDate = (date: string) => {
    dispatch({ type: 'SET_RETURN_DATE', date })
  }

  return (
    <motion.div className="scene" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <SceneBackground src={ONBOARDING_ASSETS.skySunrise}>
        {phase === 'exiting' && (
          <motion.div
            className="scene-crossfade"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${ONBOARDING_ASSETS.skyMorning})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        )}

        <ScenePosition left="50%" top="38%" widthPx={CLOUD_WIDTH} zIndex={3}>
          <CloudLoop travelVw={20} durationSeconds={9} active={phase !== 'exiting'}>
            <PixelSprite src={ONBOARDING_ASSETS.cloudSunrise} alt="Cloud" widthPx={CLOUD_WIDTH} />
          </CloudLoop>
        </ScenePosition>

        <ScenePosition left="50%" top="38%" widthPx={PLANE_WIDTH} zIndex={2}>
          {/* One persistent element across entering/idle/exiting (never
              swapped for a differently-wrapped tree) so framer-motion
              always animates onward from the plane's actual current
              position/scale instead of remounting and snapping to a fresh
              `initial`. */}
          <PixelSprite
            src={ONBOARDING_ASSETS.planeFlying}
            alt="Airplane"
            widthPx={PLANE_WIDTH}
            initial={{ x: '-40vw', y: '35vh', scale: 0.5, opacity: 0 }}
            animate={
              phase === 'exiting'
                ? { x: '30vw', y: '-90vh', scale: 0.4, opacity: [1, 1, 0] }
                : phase === 'idle'
                  ? { x: 0, y: [0, -5, 0], scale: 1, opacity: 1 }
                  : { x: 0, y: 0, scale: 1, opacity: 1 }
            }
            transition={
              phase === 'exiting'
                ? { duration: 1.6, ease: 'easeIn' }
                : phase === 'idle'
                  ? { y: { duration: 3.6, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } }
                  : { duration: ENTER_DURATION, ease: 'easeOut' }
            }
            onAnimationComplete={() => {
              if (phase === 'entering') setPhase('idle')
              // Give the viewer a beat to see the plane already departing
              // before swapping scenes, instead of cutting straight away
              // the instant the exit animation itself finishes.
              if (phase === 'exiting') setTimeout(onComplete, 500)
            }}
          />
        </ScenePosition>

        <PromptCard title={question === 'departure' ? 'When do you depart?' : 'When do you return?'}>
          {question === 'departure' ? (
            <>
              <DateField label="Departure Date" value={state.departureDate} onChange={handleDepartureDate} min={today} />
              <div className="button-row">
                <BackButton onClick={onBack} />
                <ContinueButton disabled={!state.departureDate} onClick={() => setQuestion('return')} />
              </div>
            </>
          ) : (
            <>
              <DateField
                label="Return Date"
                value={state.returnDate}
                onChange={handleReturnDate}
                min={state.departureDate ?? today}
              />
              <div className="button-row">
                <BackButton onClick={() => setQuestion('departure')} />
                <ContinueButton disabled={!state.returnDate} onClick={() => setPhase('exiting')} />
              </div>
            </>
          )}
        </PromptCard>
      </SceneBackground>
    </motion.div>
  )
}
