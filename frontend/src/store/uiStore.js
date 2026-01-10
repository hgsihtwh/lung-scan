import { create } from 'zustand'

export const useUIStore = create((set) => ({
  currentStep: 'landing',

  thumbnailOffset: 0,

  comments: '',
  feedback: null,

  isSavingFeedback: false,
  feedbackError: null,
  commentError: null,
  reportError: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  goToLanding: () => set({ currentStep: 'landing' }),

  goToUpload: () => set({ currentStep: 'upload' }),

  goToViewer: () => set({ currentStep: 'viewer' }),

  setThumbnailOffset: (offset) => set({ thumbnailOffset: offset }),

  setComments: (comments) => set({ comments }),

  clearComments: () => set({ comments: '' }),

  setFeedback: (feedback) => set({ feedback }),

  clearFeedback: () => set({ feedback: null }),

  setSavingFeedback: (saving) => set({ isSavingFeedback: saving }),

  setFeedbackError: (error) => set({ feedbackError: error }),

  setCommentError: (error) => set({ commentError: error }),

  setReportError: (error) => set({ reportError: error }),

  clearUIErrors: () =>
    set({
      feedbackError: null,
      commentError: null,
      reportError: null,
    }),

  resetUI: () =>
    set({
      currentStep: 'landing',
      thumbnailOffset: 0,
      comments: '',
      feedback: null,
      isSavingFeedback: false,
      feedbackError: null,
      commentError: null,
      reportError: null,
    }),
}))
