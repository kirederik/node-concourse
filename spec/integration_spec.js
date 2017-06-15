var Passenger = require('../passenger.js')

describe('[Integration Test]', () => {
  let client = undefined;
  let concourseURL = process.env.CONCOURSE_URL;
  let username = process.env.CONCOURSE_USERNAME;
  let password = process.env.CONCOURSE_PASSWORD;
  let teamName = process.env.TEAM_NAME;

  let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe("get pipeline", () => {
    it("pulls the pipeline configuration", (done) => {
      let fly = new Passenger({
        concourseURL: concourseURL,
        username: username,
        password: password,
        teamName: teamName
      });
      let pipeline = fly.getPipeline("sample")

      pipeline.then((p) => {
        expect(p).toBeDefined();
        expect(p.config).toBeDefined();
        expect(p.config.groups).toEqual(jasmine.any(Array));
        expect(p.config.resources).toEqual(jasmine.any(Array));
        expect(p.config.resource_types).toEqual(jasmine.any(Array));
        expect(p.config.jobs).toEqual(jasmine.any(Array));
        done();
      });
    });
  });
});
