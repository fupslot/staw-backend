* [back](../readme.md)

## Monitoring

- [Sentry](https://sentry.io/welcome/) - Errors accrued in the frontend

- [Datadog](https://www.datadoghq.com/) - Aggregate analytics and reports from one or many cloud providers to one dashboard 

- [Vercel](https://vercelcom/) - hosting solution for development process - can also be used as production env Provides uniq url in the cloud for each branch/pull-request that will provide the developers and QA to test before we merge to master All the ci/cd and integration with gihub already built in by vercel

- [Github actions](https://github.com/features/actions) - Ci/CD pipeline built in github

- [Github modules](https://github.com/orgs/github-modules/packages) - Artifactory for npm modules (can also be used by the BE for node modules)

- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Monitor SEO before pages been published, integrates with vercel

- [CMS](https://jamstack.org/headless-cms/) - Need research The idea is to deprecate wordpress and adding headless cms to all our front end applications - for easy content change - without the developer need 

- [Codecov](https://about.codecov.io/) - tests coverage analytics

- [Snyk](https://snyk.io/) - security platform for npm modules (not just npm but out of the scope currently)

- [Styleguidist](https://react-styleguidist.js.org/) - Custom react components documentation 

- Install size and compile size of each custom npm module

- [Nomad](https://www.nomadproject.io/) and [Waypoint](https://www.waypointproject.io/) for development and deploy process

- Secret manager service for env variables - [vault](https://www.vaultproject.io/), [kms](https://aws.amazon.com/kms/) or any other service


## Stack

- [React](https://reactjs.org/) - ui lib for building view and reusable components

- [Monorepo](https://github.com/korfuri/awesome-monorepo) git solution for multi micro front architecture - lerna for managing npm packages

- [React-query](https://react-query.tanstack.com/) - Fetch, cache and update data in your React and React Native applications all without touching any "global state"

- [Material-UI](https://material-ui.com/) - List of ui components built using react and google’s material design pattern, for faster and easier web development

- [Typescript](https://www.typescriptlang.org/) - Javascript on steroids

- Airbnb [eslint configuration](https://www.npmjs.com/package/eslint-config-airbnb) + [prettier](https://prettier.io/) - style system of how to write javascript  

- [Formik](https://formik.org/) - handling forms, need research on [react hook form](https://react-hook-form.com/)

- [React-use](https://github.com/streamich/react-use) - a list of react [hooks](https://reactjs.org/docs/hooks-intro.html) for front end applications

- [Jest](https://jestjs.io/) - testing framework for unit testing - 85% coverage 

- [Storybook](https://storybook.js.org/docs/react/get-started/introduction) - It makes development faster and easier by isolating components

- [Waypoint](https://www.waypointproject.io/) - Waypoint provides a modern workflow to build, deploy, and release across platforms

- [Lerna](https://lerna.js.org/) - A tool for managing javascript projects with multiple packages


## CI/CD

- [Github actions](https://github.com/features/actions) - GitHub Actions makes it easy to automate all your software workflows, now with world-class CI/CD

- Creation of automatic pull requests when modules are updated - [Renovate](https://github.com/marketplace/renovate) 

- [LGTM](https://lgtm.com/) - A code analysis for finding zero-days and preventing critical vulnerabilities

- [SonarCloud](https://sonarcloud.io/) - Code Quality, Code Security

- [Sider](https://sider.review/) - Sider helps engineering teams maximize productivity by automatically analyzing every pull request against custom per-project rulesets, as well as general best practices

- [Hound](https://houndci.com/) - Hound comments on code quality and style issues, allowing you and your team to better review and maintain a clean codebase


- Code analytics and review: Code climate, SonarCloud, Sider, LGTM, Hound, DeepSource, DeepScan, Datree, CodeFactor, Codacy, Codebeat, DeepCode, Snyk and more will be added Sadly there is no 1 tool that can do everything and check all the problems may occur in the code

## Automating Tests

- [Checkly](https://www.checklyhq.com/) - Api and E2E testing, integrates with Headless recorder (for developers)

- [Mabl](https://www.mabl.com/) - Api, visual tests and E2e testing, integrates with mabl’s trainer (for qa)