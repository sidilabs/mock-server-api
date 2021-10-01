const axios = require("axios");
const log = require("fancy-log");

const {
  config: { mountebankUrl },
  imposter,
} = require("./mconfig");

const urlImposters = mountebankUrl + "/imposters";

async function restartImposter() {
  try {
    await axios({
      method: "delete",
      url: urlImposters + "/" + imposter.port,
      timeout: 1000,
    });
    await axios({
      method: "post",
      url: urlImposters,
      timeout: 500,
      data: imposter,
    });
    log("Imposter at " + imposter.port + " (re)started...");
  } catch (error) {
    log(error.response);
    throw error;
  } finally {
  }
}

async function saveStub(stub, data) {
  try {
    const response = await axios({
      method: "post",
      url: urlImposters + "/" + imposter.port + "/stubs",
      timeout: 1000,
      data,
    });
    const status = response.status;
    if (status >= 200 && status < 300) {
      log(`Stubbed: ${stub}`);
    } else {
      log.error(`Error stubbing data: ${stub}`, response);
    }
  } catch (e) {
    log.error(`Error stubbing: ${stub}`, e);
  }
}

const createStubs = async () => {
  const stubsPackages = require("./stubs");

  for (const spNames in stubsPackages) {
    const stubs = stubsPackages[spNames];
    for (const sNames in stubs) {
      const stubData = stubs[sNames];
      await saveStub(`${spNames}:${sNames}`, stubData);
    }
  }
};

const init = async () => {
  await restartImposter();
  await createStubs();
};

module.exports = { init };
