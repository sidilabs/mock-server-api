# mock-server
A project to facilitate the use of Mountebank


## The key points for this project are:

1. **Mountebank** - server used to run the mocked API
2. **docker-compose** - used to initiate the Mountebank
3. **gulp** - run the tasks used to configure the mocked API

## Configurations

### docker-compose.yml
  - ports:
    - 2525 - default port used for Mountebank
    - 8090 - port that will be used for mock api

  - command:
    - allowInjection - flag to allow injection of functions on Mountebank

### gulpfile.js
  - used to run the tasks to configure the mock api

### mocks/mconfig.ts
  - configuration file with required values

### mocks/stubs
  - folder with all stubs packages that will be used
  - every folder directly inside `/stubs` must have an `index.ts` file that exports the stubs object
  - the export stubs object is as follow:
<pre>
  export const stubs = {
    [stubsName]: {
      stub: {
        predicates: ...,
        responses: ...,
      },
    },
  }
</pre>
  it is an object that has a stubs property that map each 'stubName' and its stub object, the stub object follow the contract of Mountebank: http://localhost:2525/docs/api/contracts?type=addStub

### mocks/stubs/index.ts
  - file that load and configure all stubs packages

### mocks/index.ts
  - file responsible to communicate with the Mountebank and configure the mock server

## Required configurations

- Docker & Docker Compose to be installed
  
## Run steps

- Inside the mocks folder: `docker-compose up -d`

- After that: `npm run mocks` to run the task to configure the mock server

  - Every time that its necessary to update the mock server it is just this command again.

## Integrating with another project:

- An project can copy all this project inside of it and make it available to others as unique project, with only a few configuration options.

- Structure example:

<pre>
/my-sample-project    - project folder
  /src                - my sample project source code
  /mocks              -  main folder used by the mock-server project.
  /gulpfile.ts        - File used by mock-server project
  /package.json       - Some configurations inside it are needed to start the mock-server project
  /tsconfig.json      - Some configuration to run correctly with Typescript
</pre>
## The current mock-server project

- Inside `/mocks/stubs` there are some folders that can be discarded, they are there to be used as a sample;

- The folder `/mocks/stubs/projects` use the api generation with urlParams and generated fields
