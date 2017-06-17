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

  // TODO: Run proper pipeline setup prior to run the tests
  describe("get pipeline", () => {
    it("pulls the pipeline configuration", async () => {
      let fly = new Passenger({
        concourseURL: concourseURL,
        username: username,
        password: password,
        teamName: teamName
      });
      let pipeline = await fly.getPipeline("sample")

      expect(pipeline).toBeDefined();
      expect(pipeline.config).toBeDefined();
      expect(pipeline.config.groups).toEqual(jasmine.any(Array));
      expect(pipeline.config.resources).toEqual(jasmine.any(Array));
      expect(pipeline.config.resource_types).toEqual(jasmine.any(Array));
      expect(pipeline.config.jobs).toEqual(jasmine.any(Array));
    });
  });
});
