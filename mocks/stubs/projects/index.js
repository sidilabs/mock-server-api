const projectList = require('./projectList.json');
const project = require('./project.json');

const { packageBaseURL } = require('../../utils');
const { ADMIN } = require('../../constants');

module.exports = {
  stubs: packageBaseURL(ADMIN, {
    projectList: {
      stub: {
        predicates: [{ equals: { method: 'GET', path: '/project' } }],
        responses: [{ is: { body: projectList } }],
      },
    },
    project: {
      stub: {
        predicates: [{ matches: { method: 'GET', path: '/project/\\d+' } }],
        responses: [{ is: { body: project } }],
      },
    },
    projectSubmit: {
      stub: {
        predicates: [
          {
            or: [
              { matches: { method: 'POST', path: '/project' } },
              { matches: { method: 'PUT', path: '/project/\\d+' } },
              { matches: { method: 'DELETE', path: '/project/\\d+' } },
            ],
          },
        ],
        responses: [{ is: { statusCode: 200 } }],
      },
    },
  }),
};
