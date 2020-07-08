# The Fabricius Project

Fabricius is a collaborative project between Google Arts & Culture, the Australian Centre of Egyptology at Macquarie University and Ubisoft. Together we developed the first digital tool that gives experts a fast way to decode the ancient Egyptian language (Hieroglyphs) and everyone else an easy way to learn about and even write in this ancient language.

## The Workbench

Browser-based tools for finding and classifying hieroglyphs in images.

## Development

This web app is built using Angular.

First run `npm install`.

To start the local development server just use `ng serve`.

### Dependencies

The workbench use 3 apis to run in the backend. These can be found in the following repositaries.

classifier-automl [googleartsculture/classifier-automl](https://github.com/googleartsculture/classifier-automl)

translation [googleartsculture/translation](https://github.com/googleartsculture/translation)

The translation uses data from: Berlin-Brandenburg Academy of Sciences and Humanities (Berlin, Germany) and Saxon Academy of Sciences and Humanities
(Leipzig, Germany), research project  "Structure and Transformation in the Vocabulary of the Egyptian Language", CC BY-SA 4.0 Int.

cluster-analysis [googleartsculture/cluster-analysis](https://github.com/googleartsculture/cluster-analysis)

## Built With

- [Angular CLI](https://cli.angular.io/)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE.md](./LICENSE.md) file for details
