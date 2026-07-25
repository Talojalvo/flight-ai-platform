import { useAssetPreloader } from '../features/onboarding/useAssetPreloader'
import { ALL_ONBOARDING_ASSET_URLS } from '../features/onboarding/assets'
import { OnboardingFlow } from '../features/onboarding/OnboardingFlow'

export function OnboardingPage() {
  const assetsReady = useAssetPreloader(ALL_ONBOARDING_ASSET_URLS)

  if (!assetsReady) {
    return (
      <div className="preload-screen">
        <span>Loading experience…</span>
      </div>
    )
  }

  return <OnboardingFlow />
}
