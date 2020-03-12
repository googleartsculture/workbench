export const environment = {
  appVersion: '',
  production: true,
  config: {
    apiServices: {
      enabled: true,
      // Replace this value.
      key: 'CHANGE_ME',
      translation: {
        // Set this to the correct backend.
        url: 'https://translation-api-dot-rosetta-ai-dev.appspot.com '
      },
      clusterAnalysis: {
        // Set this to the correct backend.
        url: 'https://cluster-analysis-api-dot-rosetta-ai-dev.appspot.com'
      },
      classification: {
        // Set this to the correct backend.
        url: 'https://classification-api2-dot-rosetta-ai-dev.appspot.com',
        models: [
          {
            displayName: 'Hieroglyphs',
            name: 'ICN7361549319569331597',
            version: 'ICN7361549319569331597'
          }
        ] // add
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
