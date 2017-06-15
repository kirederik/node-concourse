var Passenger = require('../passenger');
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

    fly = new Passenger(authObject);
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('constructor', () => {
    describe('arguments', () => {
      it('errors when the arguments are not passed', () => {
        expect(() => { new Passenger() }).toThrow([
          'concourse url not set',
          'username not set',
          'password not set',
          'team name not set'
        ])
      });
    });
  });

  describe('#accessToken', () => {
    it('sets the auth token', (done) => {
      fly.accessToken().then((t) => {
        expect(t).toEqual('Bearer token');
        done();
      }, done.fail);
    })

    it('throws when the credentials are invalid', (done) => {
      server = nock(concourseURL)
        .get('/api/v1/teams/main/auth/token')
        .basicAuth({user: username, pass: password+'wrong'})
        .reply(401,'not authorized');
      authObject.password += 'wrong';
      fly = new Passenger(authObject)

      fly.accessToken().then(done.fail, (error) => {
        expect(error.message).toContain('not authorized');
        done();
      })
    })
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

    it('pulls the pipeline configuration', (done) => {
      fly.getPipeline('thepipe').then((config) => {
        expect(config).toEqual(JSON.parse(pipelineConfig));
        done();
      }, done.fail);
    });

    it('throws when the pipeline name is not specified', () => {
      expect(fly.getPipeline).toThrowError(/Missing Argument: pipelineName/)
    });
  });
});

