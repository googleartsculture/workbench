export const environment = {
  appVersion: '',
  production: true,
  config: {
    apiServices: {
      enabled: true,
      // Replace this value.
      key: '',
      translation: {
        // Set this to the correct backend.
        url: ''
      },
      clusterAnalysis: {
        // Set this to the correct backend.
        url: ''
      },
      classification: {
        // Set this to the correct backend.
        url: '',
        models: []
      }
    },
    fontServices: {
      webfontloaderConfig: {}
    },
    localisation: {
      default: 'en-us',
      langs: []
    }
  }
};
