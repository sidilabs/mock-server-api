# mock-server-api
A project to facilitate the use of Mountebank

## The key points for this project are:

1. **Mountebank** - server used to run the mocked API

## Configurations

To use this project the easiest way is to use the `/sample-project` as it already contains a package.json configured and the structure to initiate the mocked api.

### src/mconfig.ts
  - configuration file with required values

### src/stubs
  - folder with all stubs packages that will be used
  - every folder directly inside `/stubs` must have an `index.ts` file that exports the stubs object
  - the export stubs object is as follow:
<pre>
  export const stubs = {
    [stubsName]:  {
      predicates: ...,
      responses: ...,
    },
  }
</pre>
  it is an object that map each property or 'stubName' to it's stub object, the stub has two properties: predicates and responses.

  As you can see the predicates in https://www.mbtest.org/docs/api/predicates or http://localhost:2525/docs/api/predicates if the mountebank is running.

  And the responses in https://www.mbtest.org/docs/api/stubs or http://localhost:2525/docs/api/stubs


### src/stubs/index.ts
  - file that load and configure all stubs packages

###  src/index.ts
  - file responsible to communicate with the Mountebank and configure the mock server

## Required configurations 

-  On the command line inside the base folder of the repository, run: `npm i` to install everything
  
## Run steps using 

- On the command line run: `npm run mb`

- On an new command line run: `npm run mock`

  - Every time that its necessary to update the mock server it is just this last command again.


## Integrating with another project:

- An project can copy all the sample project inside of it and make it available to others as unique project, with only a few configuration options.

- Structure example:

<pre>
/my-sample-project    - project folder
  /src                - my sample project source code
  /mocks              -  main folder used by the mock-server-api project.
  /package.json       - Some configurations inside it are needed to start the mock-server project
  /tsconfig.json      - Some configuration to run correctly with Typescript
</pre>
## The current mock-server project

- Inside `/mocks/stubs` there are some folders that can be discarded, they are there to be used as a sample;

#### There is two methods of generating the mock:
1. from any index.ts inside a folder in `/mock/stubs` export the stubs as: `export const stubs`
    1. This `stubs` const is a mapper of stubs as `{ anyStubName: {} as StubData } as StubCollection`
    2. For better understanding see the file `@types/index.ts` there is a lot of definitions including `StubData` and `StubCollection`
2. from any index.ts inside a folder in `/mock/stubs` export the apis as: `export const apis`
    1. A better example is implemented on the folder `/mocks/stubs/projects` there is use of urlParams, generated fields and query functions;


### Query filters options  (using list-total model api)
There are some options for query filters they are:

- "CONTAINS" : the query param name must be equal to the param inside the object,  the query param value must be inside the object param value

- any other string: the same as "CONTAINS" but it  will search for equality;

- array [param, type]: the 'param' is the param name in the object, the 'type' follow the above rules

- (funtion) : the funcion will have this structure:  (list: any[], value: any, config: ConfigInjection) => any[];
  - list: array of values that would be returned without this filter,
  - value: the value of the query param;
  - config: object containing all the values passed by Mountebank

- queryPriority: set the priority of an query, if the priority is greater than 9 that query will be executed after extract the list length, default value is 5.

- `list-total/utils.ts` there are 2 functions that could be used to add query function: `sort` = used to sort the result list,  `offset` = used for pagination, a sample of use is on `/mocks/stubs/projects`


# THE NEWEST SUPER COOL WAY TO CREATE RESPONSES:

On the sample-project there is this folder withImport with this `StubCollection`:

<pre>
 {
  withImport: {
    predicates: [{ equals: { method: "GET", path: "/_demo/withImport" } }],
    responses: [
      {
        run: "/withImport/fns.firstFn",
        _behaviors: {
          wait: 1000,
        },
      },
      {
        run: "/withImport.innerFn",
      },
    ],
  },
};
</pre>

The main point is to use an exported function inside the stub response, it will only need to pass the path to the function on the following format:
`"/pathToFolder/InsideStubs/Location/FileName.functionExported"`

