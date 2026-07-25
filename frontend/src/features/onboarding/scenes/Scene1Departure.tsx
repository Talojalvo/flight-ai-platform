import { useState } from 'react'
import { motion } from 'framer-motion'
import { SceneBackground } from '../components/SceneBackground'
import { ScenePosition } from '../components/ScenePosition'
import { PixelSprite } from '../components/PixelSprite'
import { PromptCard } from '../components/PromptCard'
import { AirportSelectField } from '../components/AirportSelectField'
import { TravelerCountField } from '../components/TravelerCountField'
import { ContinueButton } from '../components/ContinueButton'
import { BackButton } from '../components/BackButton'
import { ONBOARDING_ASSETS } from '../assets'
import { useTripPlan } from '../../../state/TripPlanContext'

type Phase = 'form' | 'planeArriving' | 'destination' | 'takeoff'

const PLANE_WIDTH = 'clamp(200px, 26vw, 520px)'

interface Scene1DepartureProps {
  onComplete: () => void
  /** Resume at the destination question (entered via Back from Scene2) instead of the departure form. */
  enterAtEnd?: boolean
}

export function Scene1Departure({ onComplete, enterAtEnd = false }: Scene1DepartureProps) {
  const { state, dispatch } = useTripPlan()
  const [phase, setPhase] = useState<Phase>(enterAtEnd ? 'destination' : 'form')
  const [planeImage, setPlaneImage] = useState<string>(ONBOARDING_ASSETS.planeFirst)

  const handleContinueFromForm = () => {
    setPhase('planeArriving')
  }

  const handleContinueFromDestination = () => {
    setPhase('takeoff')
    setTimeout(() => setPlaneImage(ONBOARDING_ASSETS.planeFlying), 350)
  }

  return (
    <motion.div className="scene" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <SceneBackground src={ONBOARDING_ASSETS.airportSunrise}>
        {phase === 'takeoff' && (
          <motion.div
            className="scene-crossfade"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${ONBOARDING_ASSETS.skySunrise})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />
        )}

        {phase !== 'form' && (
          <ScenePosition left="50%" bottom="10%" widthPx={PLANE_WIDTH} zIndex={2}>
            <PixelSprite
              src={planeImage}
              alt="Airplane"
              widthPx={PLANE_WIDTH}
              initial={{ y: '55vh', opacity: 0 }}
              animate={
                phase === 'takeoff'
                  ? { y: '-130vh', opacity: [1, 1, 0], scale: 0.75 }
                  : { y: 0, opacity: 1 }
              }
              transition={
                phase === 'takeoff' ? { duration: 1.6, ease: 'easeIn' } : { duration: 1.1, ease: 'easeOut' }
              }
              onAnimationComplete={() => {
                if (phase === 'planeArriving') setPhase('destination')
                if (phase === 'takeoff') onComplete()
              }}
            />
          </ScenePosition>
        )}

        {phase === 'form' && (
          <PromptCard title="Where are you flying from?">
            <AirportSelectField
              label="Departure Airport"
              value={state.origin}
              onSelect={(code) => dispatch({ type: 'SET_ORIGIN', origin: code })}
            />
            <TravelerCountField
              value={state.travelers}
              onChange={(count) => dispatch({ type: 'SET_TRAVELERS', travelers: count })}
            />
            <ContinueButton disabled={!state.origin} onClick={handleContinueFromForm} />
          </PromptCard>
        )}

        {phase === 'destination' && (
          <PromptCard title="Where would you like to go?">
            <AirportSelectField
              label="Destination Airport"
              value={state.destination}
              onSelect={(code) => dispatch({ type: 'SET_DESTINATION', destination: code })}
              excludeCode={state.origin}
            />
            <div className="button-row">
              <BackButton onClick={() => setPhase('form')} />
              <ContinueButton disabled={!state.destination} onClick={handleContinueFromDestination} />
            </div>
          </PromptCard>
        )}
      </SceneBackground>
    </motion.div>
  )
}
