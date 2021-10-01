const { init } = require("./mocks");

const createStubs = async function () {
  await init();
};

module.exports = {
  createStubs,
};
