export const ONBOARDING_ASSET_BASE = '/assets/flight_flow'

export const ONBOARDING_ASSETS = {
  airportSunrise: `${ONBOARDING_ASSET_BASE}/airport_sunrise.png`,
  airportMorning: `${ONBOARDING_ASSET_BASE}/airport_morning.png`,
  skySunrise: `${ONBOARDING_ASSET_BASE}/pixel_sky_sunrise.png`,
  skyMorning: `${ONBOARDING_ASSET_BASE}/pixel_sky_morning.png`,
  planeFirst: `${ONBOARDING_ASSET_BASE}/pixel_plane_first.png`,
  planeFlying: `${ONBOARDING_ASSET_BASE}/pixel_fly_plane.png`,
  planeLandingMorning: `${ONBOARDING_ASSET_BASE}/pixel_landing_morning.png`,
  planeLanded: `${ONBOARDING_ASSET_BASE}/pixel_landed.png`,
  cloudSunrise: `${ONBOARDING_ASSET_BASE}/cloud_sunrise.png`,
  cloudMorning: `${ONBOARDING_ASSET_BASE}/cloud_morning.png`
} as const

export type OnboardingAssetKey = keyof typeof ONBOARDING_ASSETS

export const ALL_ONBOARDING_ASSET_URLS: string[] = Object.values(ONBOARDING_ASSETS)
