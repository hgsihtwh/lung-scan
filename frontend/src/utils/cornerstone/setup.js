import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import dicomParser from 'dicom-parser'

let isInitialized = false

export const initCornerstone = () => {
  if (isInitialized) return

  try {
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser

    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: false,
          usePDFJS: false,
        },
      },
    })

    isInitialized = true
    console.log('Cornerstone initialized successfully')
  } catch (err) {
    console.error('Failed to initialize Cornerstone:', err)
  }
}

export { cornerstone, cornerstoneWADOImageLoader }
