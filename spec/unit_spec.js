var FlyClient = require('../index');
let nock = require('nock');
const fs = require('fs');

describe('[Unit test]', () => {
  let server, fly;
  let username = 'admin', password = 'example_pass';
  let concourseURL = 'https://concourse.example.com';
  let teamName = 'main';
  let authObject = {};

  beforeEach(() => {
    nock.disableNetConnect();
    server = nock(concourseURL)
      .get('/api/v1/teams/main/auth/token')
      .basicAuth({user: username, pass: password})
      .reply(200, '{"type":"Bearer","value":"token"}')

    authObject = {
      concourseURL: concourseURL,
      username: username,
      password: password,
      teamName: teamName
    };

    fly = new FlyClient(authObject);
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('constructor', () => {
    describe('arguments', () => {
      it('errors when the arguments are not passed', () => {
        expect(() => { new FlyClient() }).toThrow([
          'concourse url not set',
          'username not set',
          'password not set',
          'team name not set'
        ])
      });
    });
  });

  describe('#accessToken', () => {
    it('sets the auth token', async () => {
      token = await fly.accessToken();
      expect(token).toEqual('Bearer token');
    });

    it('caches the auth token', async () => {
      token = await fly.accessToken();
      expect(token).toEqual('Bearer token');
      token = await fly.accessToken();
      expect(token).toEqual('Bearer token');
    });

    it('throws when the credentials are invalid', async () => {
      server = nock(concourseURL)
        .get('/api/v1/teams/main/auth/token')
        .basicAuth({user: username, pass: password+'wrong'})
        .reply(401,'not authorized');
      authObject.password += 'wrong';
      fly = new FlyClient(authObject)

      try {
        await fly.accessToken();
        failThrowExpected();
      } catch (error) {
        expect(error.message).toContain('not authorized');
      };
    });

    it('errors when the response is not a valid json', async () => {
      server = nock(concourseURL)
        .get('/api/v1/teams/fake/auth/token')
        .reply(200,'undefined');
      authObject.teamName = "fake";
      fly = new FlyClient(authObject);

      try {
        await fly.accessToken();
        failThrowExpected();
      } catch (error) {
        expect(error.message).toContain('SyntaxError: Unexpected token u in JSON at position 0');
      };
    });
  });

  describe('#getPipeline', () => {
    let pipelineConfig;
    beforeEach(() => {
      pipelineConfig = fs.readFileSync(`${__dirname}/support/pipeline_config.json`);
      server = server
        .get('/api/v1/teams/main/pipelines/thepipe/config')
        .matchHeader('authorization', 'Bearer token')
        .reply(200, pipelineConfig)
    });

    it('pulls the pipeline configuration', async () => {
      expect(await fly.getPipeline('thepipe')).toEqual(JSON.parse(pipelineConfig));
    });

    it('throws when the pipeline name is not specified', () => {
      expect(fly.getPipeline).toThrowError(/Missing Argument: pipelineName/)
    });
  });

  describe('#setTeam', () => {
    let creds = {
      basic: {
        username: 'foo',
        password: 'bar'
      }
    }

    beforeEach(() => {
      server = server
        .put('/api/v1/teams/myteam')
        .matchHeader('authorization', 'Bearer token')
        .reply(200, '{}')
    });

    fit('creates a new team with the provided creds', async () => {
      let response = await fly.setTeam('myteam', creds)
      expect(response).toEqual({})
    })
  })
});

function failThrowExpected() {
  fail("Expecting an error; nothing was raised");
}
