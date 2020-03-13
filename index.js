let request = require('request');

class FlyClient {
  constructor(args) {
    let err = this._validateInputs(args);
    if (err.length > 0) {
      throw err;
    }
    this.concourseURL = args.concourseURL.replace(new RegExp("/$"), "");
    this.username = args.username;
    this.password = args.password;
    this.teamName = args.teamName;
    this._authToken = "";
  }

  getPipeline(pipelineName) {
    if (pipelineName == undefined) {
      throw new Error('Missing Argument: pipelineName');
    }
    return this._doAuthRequest(`api/v1/teams/${this.teamName}/pipelines/${pipelineName}/config`);
  }

  setTeam(teamName, credentials) {
    return this._doAuthRequest(`api/v1/teams/${this.teamName}/`, {method: 'PUT', body: credentials});
  }

  async accessToken() {
    if (this._authToken == "") {
      let authHeader = new Buffer(`${this.username}:${this.password}`).toString('base64');
      let options = {
        method: 'GET',
        url: `${this.concourseURL}/api/v1/teams/${this.teamName}/auth/token`,
        headers: {
          'Authorization': `Basic ${authHeader}`
        }
      };
      let resp = await this._doRequest(options);
      this._authToken = `${resp.type} ${resp.value}`;
    }
    return this._authToken;
  }

  async _doAuthRequest(path, opts = {}) {
    console.log("pre auth")
    let accessToken = await this.accessToken();
    console.log(accessToken)
    let reqBody = opts.body && JSON.stringify(opts.body) || null

    let options = {
      method: opts.method || 'GET',
      url: `${this.concourseURL}/${path}`,
      headers: {
        'Authorization': `${accessToken}`
      },
      body: reqBody
    };

    console.log(options)

    return this._doRequest(options);
  }

  async _doRequest(options) {
    options.headers['User-Agent'] = 'request';
    return new Promise((resolve, reject) => {
      request(options, (_, response, body) => {
        if (response && response.statusCode != 200) {
          reject(new Error(`${options.method} ${options.url}: ${body}`))
        } else {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`${options.method} ${options.url}: ${body} -- cause: ${e}`))
          }
        }
      });
    });
  }

  _validateInputs(args) {
    let errs = [];
    (!args || args.concourseURL == "") && errs.push("concourse url not set");
    (!args || args.username == "") && errs.push("username not set");
    (!args || args.password == "") && errs.push("password not set");
    (!args || args.teamName == "") && errs.push("team name not set");
    return errs;
  }
}

module.exports = FlyClient;
