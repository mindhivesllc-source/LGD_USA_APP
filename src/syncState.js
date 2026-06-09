export const state = {
  isRunning: false,
  stopRequested: false,
  lastRun: null,
  cooldownUntil: null,
  totalProducts: 0,
  lastPushed: 0,
  lastFailed: 0,
  lastDuration: null,
  lastError: null,
  syncCount: 0,
  categoryCounts: {},
  nextRun: null,
}

export function updateState(updates) {
  Object.assign(state, updates)
}

export function getState() {
  return { ...state }
}

export function requestStop() {
  state.stopRequested = true
}

export function shouldStop() {
  return state.stopRequested
}

export function resetStop() {
  state.stopRequested = false
}

export function isCooldownActive(cooldownMinutes = 15) {
  if (!state.cooldownUntil) return false
  return Date.now() < new Date(state.cooldownUntil).getTime()
}

export function getCooldownRemaining(cooldownMinutes = 15) {
  if (!state.cooldownUntil) return 0
  const remaining = new Date(state.cooldownUntil).getTime() - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000 / 60))
}

export function getCooldownRemainingSeconds() {
  if (!state.cooldownUntil) return 0
  const remaining = new Date(state.cooldownUntil).getTime() - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
}

export function setCooldown(minutes = 15) {
  state.cooldownUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export function clearCooldown() {
  state.cooldownUntil = null
  state.lastError = null
}
