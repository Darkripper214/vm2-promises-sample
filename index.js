const async_hooks = require('async_hooks');
const fetch = require('node-fetch');
const fs = require('fs');
const util = require('util');
const eid = async_hooks.executionAsyncId;
const tid = async_hooks.triggerAsyncId;
const { VM } = require('vm2');

// using this to write to console instead of console.log as console.log will cause stackoverflow
function debug(...args) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
}
const asyncIdToResource = {};

const init = (asyncId, type, triggerAsyncId, resource) => {
  asyncIdToResource[asyncId] = resource;
  if (type === 'PROMISE') {
    debug(
      `Init, type: ${type}, asyncID: ${asyncId}, triggerAsyncID: ${triggerAsyncId}`
    );
  }
  if (type === 'Microtask') {
    debug(
      `Init, type: ${type}, asyncID: ${asyncId}, triggerAsyncID: ${triggerAsyncId}`
    );
  }
};

const before = (asyncId) => {
  const resource = asyncIdToResource[asyncId] || {};
  const resourceName = resource.constructor.name;
  if (resourceName === 'PromiseWrap') {
    debug(`before, asyncID: ${asyncId}, triggerID: ${tid()}`);
  }
  if (resourceName === 'Timeout') {
    debug(`before, asyncID: ${asyncId}, triggerID: ${tid()}`);
  }
  if (resourceName === 'AsyncResource') {
    debug(`before, asyncID: ${asyncId}, triggerID: ${tid()}`);
  }
};

const after = (asyncId) => {
  const resource = asyncIdToResource[asyncId] || {};
  const resourceName = resource.constructor.name;

  if (resourceName === 'PromiseWrap') {
    debug(`after, asyncID: ${asyncId}, triggerID: ${tid()}`);
  }
  if (resourceName === 'AsyncResource') {
    debug(`after, asyncID: ${asyncId}, triggerID: ${tid()}`);
  }
};

const destroy = (asyncId) => {
  // debug(`destroy, asyncID: ${asyncId}, triggerID: ${tid()}`);
};

const promiseResolve = (asyncId) => {
  debug(`promiseResolve, asyncID: ${asyncId}, triggerID: ${tid()}`);
};

const asyncHook = async_hooks.createHook({
  init,
  before,
  after,
  destroy,
  promiseResolve,
});

asyncHook.enable();

// This will create 3 promises, for 'async', 'await' and 'fetch'
// (async function hello() {
//   const x = await fetch('https://www.google.com');
//   console.log(x.size);
// })();

// While running the same code in vm will have 5 promises
const vm = new VM({
  timeout: 6000,
  sandbox: {
    fetch,
    queueMicrotask,
  },
});
const code = `(async function hello() {
  await fetch('https://www.google.com');
})();`;

vm.run(code);
