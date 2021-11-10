import { init } from "./mocks";

const createStubs = async function () {
  await init();
};

module.exports = {
  createStubs,
};
