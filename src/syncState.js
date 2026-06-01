export const state = {
  isRunning: false,
  lastRun: null,
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
