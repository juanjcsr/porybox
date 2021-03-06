const supertest = require('supertest-as-promised');
const defaults = require('superagent-defaults');
const expect = require('chai').use(require('dirty-chai')).expect;
// start a fake SMTP server on port 1235
const emailServer = require('smtp-tester').init(1235, {disableDNSValidation: true});
const emailEmitter = new (require('events').EventEmitter);
emailServer.bind((address, id, email) => emailEmitter.emit('email', email));

module.exports = {
  getAgent () {
    const agent = defaults(supertest.agent(sails.hooks.http.app));
    return agent.get('/csrfToken').then(res => {
      expect(res.statusCode).to.equal(200);
      agent.set('x-csrf-token', res.body._csrf);
      /* Due to a quirk in how supertest-as-promised and superagent-defaults work together, a `.then` method gets attached
      to the agent. We don't want the agent to be treated as a thenable when returning from this function, so just get rid of
      the .then function. */
      agent.then = undefined;
    }).return(agent);
  },
  emailEmitter
};
