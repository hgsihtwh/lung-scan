import { create } from 'zustand'

export const useScanStore = create((set, get) => ({
  currentScanId: null,
  currentScanDetails: null,
  sliceNumbers: [],
  currentSlice: null,

  isLoadingScan: false,
  isAnalyzing: false,

  scanError: null,
  analysisError: null,

  setCurrentScanId: (id) => set({ currentScanId: id }),

  setCurrentScanDetails: (details) => set({ currentScanDetails: details }),

  setSliceNumbers: (numbers) => {
    const unique = [...new Set(numbers)].sort((a, b) => a - b)
    set({
      sliceNumbers: unique,
      currentSlice: unique.length > 0 ? unique[0] : null,
    })
  },

  setCurrentSlice: (sliceNumber) => set({ currentSlice: sliceNumber }),

  setLoadingScan: (loading) => set({ isLoadingScan: loading }),

  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

  setScanError: (error) => set({ scanError: error }),

  setAnalysisError: (error) => set({ analysisError: error }),

  clearErrors: () => set({ scanError: null, analysisError: null }),

  nextSlice: () => {
    const { sliceNumbers, currentSlice } = get()
    const currentIndex = sliceNumbers.indexOf(currentSlice)

    if (currentIndex < sliceNumbers.length - 1) {
      set({ currentSlice: sliceNumbers[currentIndex + 1] })
    }
  },

  previousSlice: () => {
    const { sliceNumbers, currentSlice } = get()
    const currentIndex = sliceNumbers.indexOf(currentSlice)

    if (currentIndex > 0) {
      set({ currentSlice: sliceNumbers[currentIndex - 1] })
    }
  },

  updateAnalysisResult: (verdict, probability) =>
    set((state) => ({
      currentScanDetails: {
        ...state.currentScanDetails,
        verdict,
        probability,
      },
    })),

  updateFeedback: (isAccurate, comment = null) =>
    set((state) => ({
      currentScanDetails: {
        ...state.currentScanDetails,
        has_feedback: true,
        is_accurate: isAccurate,
        user_comment: comment,
      },
    })),

  resetScan: () =>
    set({
      currentScanId: null,
      currentScanDetails: null,
      sliceNumbers: [],
      currentSlice: null,
      isLoadingScan: false,
      isAnalyzing: false,
      scanError: null,
      analysisError: null,
    }),
}))
