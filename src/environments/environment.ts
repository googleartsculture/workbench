export const environment = {
    appVersion: '',
    production: true,
    config: {
      apiServices: {
        enabled: true,
        key: 'DEPRECATED',
        confirmation: {
          url: 'https://confrimation-api-rosetta-ai-dev.ew.r.appspot.com'
        },
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
              name: 'ICN376997904574787450',
              version: 'ICN376997904574787450'
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
