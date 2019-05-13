# Workbench

Browser-based tools for finding and classifying hieroglyphs in images.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project to a remote system.

### Dependencies

- GIT: [Latest stable version](https://git-scm.com/downloads)
- Node & NPM: [Latest LTS versions](https://nodejs.org/en/download/)
- Yarn: [Latest stable version](https://yarnpkg.com/en/docs/install)

### Installing

- Run `yarn install` to install the projects Node dependencies.
- Create the following files in the `/src/environments/` directory and define your environment config:

`environment.ts` (Used for local development)
```typescript
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  appVersion: require('../../package.json').version,
  config: {
    apiServices: {
      enabled: false,
      key: '{{ Insert API key here }}',
      clusterAnalysis: {
        url: '{{ Insert cluster-analysis API origin here }}',
      },
      classification: {
        url: '{{ Insert classification API origin here }}',
        models: [
          {
            displayName: '{{ Insert classification model display name here }}',
            name: '{{ Insert classification model name here }}',
            version: '{{ Insert classification model version here }}',
          },
        ],
      },
      translation: {
        url: '{{ Insert translation API origin here }}',
      },
    },
    fontServices: {
      webfontloaderConfig: {
        // Insert WebFontLoader family config here. See https://github.com/typekit/webfontloader#modules
        // E.G:
        custom: {
          families: ['My Font', 'My Other Font:n4,i4,n7'],
        },
      },
    },
    localisation: {
      langs: ['en'],
      default: 'en',
    }
  }
};
```

`environment.prod.ts` (Used for built and deployed applications)
```typescript
export const environment = {
  production: true,
  appVersion: require('../../package.json').version,
  config: {
    apiServices: {
      enabled: false,
      key: '{{ Insert API key here }}',
      clusterAnalysis: {
        url: '{{ Insert cluster-analysis API origin here }}',
      },
      classification: {
        url: '{{ Insert classification API origin here }}',
        models: [
          {
            displayName: '{{ Insert classification model display name here }}',
            name: '{{ Insert classification model name here }}',
            version: '{{ Insert classification model version here }}',
          },
        ],
      },
      translation: {
        url: '{{ Insert translation API origin here }}',
      },
    },
    fontServices: {
      webfontloaderConfig: {
        // Insert WebFontLoader family config here. See https://github.com/typekit/webfontloader#modules
        // E.G:
        custom: {
          families: ['My Font', 'My Other Font:n4,i4,n7'],
        },
      },
    },
    localisation: {
      langs: ['en'],
      default: 'en',
    }
  }
};
```

## Local development

- Run `yarn start` to spin up a local dev server. Navigate to `http://localhost:4200/` once the initial build is complete. The app will automatically reload when changes are made to the source files.

## Building the application

- Run `yarn build` to build the app. The build artifacts will be created in the `dist/` directory.
- Run `yarn build-serve` to build the app and serve it (via [superstatic](https://github.com/firebase/superstatic)) on `http://localhost:8080/`. The build artifacts will be created and run from the `dist/` directory.

## Testing

### Running linting and code style tests

- Run `yarn lint` to execute the SCSS (via [stylelint](https://stylelint.io/)) and TypeScript linting tests (via [tslint](https://palantir.github.io/tslint/))

### Running unit tests

- Run `yarn test` to execute the unit tests (via [Karma](https://karma-runner.github.io)) and have the app automatically retest when changes are made to the source files.

### Running end-to-end tests

- Run `yarn e2e` to execute the end-to-end tests (via [Protractor](http://www.protractortest.org/)).

## Deployment

### Google App Engine

#### Dependencies

- Google Cloud SDK: [Latest version](https://cloud.google.com/sdk/install)

#### Setup

- Create a new Python App Engine project [here](https://console.cloud.google.com/projectselector/appengine/create?lang=python).

#### Deploying the app

- Run `yarn build` to build the app using production environment config
- Run `gcloud app deploy --project={{ Target AppEngine project ID }} --version={{ Target AppEngine project version }} ./dist/` to begin the deploy process
- Follow the prompts to deploy to your remote Google App Engine environment

If you experience any issues with the Google Cloud SDK please check the [support pages](https://cloud.google.com/sdk/docs/getting-support) for a possible solution.

## Built With

- [Angular CLI](https://cli.angular.io/)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/hieroglyphics-initiative/workbench/tags).

## Authors

- *Initial work* - [Psycle](https://www.psycle.com)

See also the list of [contributors](https://github.com/hieroglyphics-initiative/workbench/graphs/contributors) who participated in this project.

## License

This project is currently licensed under the Apache License, Version 2.0 - see the [LICENSE.md](./LICENSE.md) file for details

## Acknowledgments

- [Ubisoft](https://www.ubisoft.com)
- [Google](https://www.google.com)
- [Psycle](https://www.psycle.com)
