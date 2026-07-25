import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scene1Departure } from './scenes/Scene1Departure'
import { Scene2Dates } from './scenes/Scene2Dates'
import { Scene3Hotel } from './scenes/Scene3Hotel'
import { Scene4Landing } from './scenes/Scene4Landing'

type SceneId = 'scene1' | 'scene2' | 'scene3' | 'scene4'

const SCENE_ORDER: SceneId[] = ['scene1', 'scene2', 'scene3', 'scene4']

export function OnboardingFlow() {
  const [sceneIndex, setSceneIndex] = useState(0)
  // Whether the scene we just navigated to should resume at its last
  // question (entered via Back) rather than replay its entrance animation.
  const [enteredFromBack, setEnteredFromBack] = useState(false)
  const navigate = useNavigate()
  const currentScene = SCENE_ORDER[sceneIndex]

  const goToNextScene = () => {
    setEnteredFromBack(false)
    setSceneIndex((index) => Math.min(index + 1, SCENE_ORDER.length - 1))
  }

  const goToPreviousScene = () => {
    setEnteredFromBack(true)
    setSceneIndex((index) => Math.max(index - 1, 0))
  }

  const handleSearch = () => {
    navigate('/loading')
  }

  return (
    <div className="onboarding-stage">
      <AnimatePresence mode="wait">
        {currentScene === 'scene1' && (
          <Scene1Departure key="scene1" onComplete={goToNextScene} enterAtEnd={enteredFromBack} />
        )}
        {currentScene === 'scene2' && (
          <Scene2Dates
            key="scene2"
            onComplete={goToNextScene}
            onBack={goToPreviousScene}
            enterAtEnd={enteredFromBack}
          />
        )}
        {currentScene === 'scene3' && (
          <Scene3Hotel
            key="scene3"
            onComplete={goToNextScene}
            onBack={goToPreviousScene}
            enterAtEnd={enteredFromBack}
          />
        )}
        {currentScene === 'scene4' && (
          <Scene4Landing key="scene4" onSearch={handleSearch} onBack={goToPreviousScene} />
        )}
      </AnimatePresence>
    </div>
  )
}
