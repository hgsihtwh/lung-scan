import { cornerstone } from './setup'

export const getViewport = (element) => {
  if (!element) return null

  try {
    return cornerstone.getViewport(element)
  } catch (err) {
    console.error('Error getting viewport:', err)
    return null
  }
}

export const setViewport = (element, viewport) => {
  if (!element || !viewport) return false

  try {
    cornerstone.setViewport(element, viewport)
    return true
  } catch (err) {
    console.error('Error setting viewport:', err)
    return false
  }
}

export const zoomIn = (element, step = 0.25) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.scale += step
  return setViewport(element, viewport)
}

export const zoomOut = (element, step = 0.25, minScale = 0.25) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.scale = Math.max(minScale, viewport.scale - step)
  return setViewport(element, viewport)
}

export const rotate = (element, degrees = 90) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.rotation += degrees
  return setViewport(element, viewport)
}

export const pan = (element, deltaX, deltaY) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.translation.x += deltaX / viewport.scale
  viewport.translation.y += deltaY / viewport.scale
  return setViewport(element, viewport)
}

export const resetViewport = (element) => {
  if (!element) return false

  try {
    cornerstone.reset(element)
    return true
  } catch (err) {
    console.error('Error resetting viewport:', err)
    return false
  }
}

export const fitToWindow = (element) => {
  if (!element) return false

  try {
    cornerstone.fitToWindow(element)
    return true
  } catch (err) {
    console.error('Error fitting to window:', err)
    return false
  }
}

export const setWindowLevel = (element, windowWidth, windowCenter) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.voi.windowWidth = windowWidth
  viewport.voi.windowCenter = windowCenter
  return setViewport(element, viewport)
}

export const invert = (element) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.invert = !viewport.invert
  return setViewport(element, viewport)
}

export const flipHorizontal = (element) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.hflip = !viewport.hflip
  return setViewport(element, viewport)
}

export const flipVertical = (element) => {
  const viewport = getViewport(element)
  if (!viewport) return false

  viewport.vflip = !viewport.vflip
  return setViewport(element, viewport)
}
