'use strict';

const { default: axios } = require('axios');
const mochaPlugin = require('serverless-mocha-plugin');
const DynamoDbLocal = require('dynamodb-local');
const dynamoLocalPort = 8000;
 
 
const expect = mochaPlugin.chai.expect;
let wrapped = mochaPlugin.getWrapper('otf', '/index.js', 'handler');

describe('OTF User API Test', async () => {

  const child = await DynamoDbLocal.launch(dynamoLocalPort, null, [], false, true); // must be wrapped in async function
  let randomUser;

  before(async () => {
    const response = await axios.get('https://randomuser.me/api/');
    const randomData = response.data.results[0];
    randomUser = {
      email: randomData.email,
      firstName: randomData.name.first,
      lastName: randomData.name.last,
      phone: randomData.phone,
      gender: randomData.gender,
    }
  });

  describe('test logic', ()=> {
    it('test put', async ()=> {
      const putData = {httpMethod: 'PUT', body: JSON.stringify(randomUser)}
      const response = await wrapped.run(putData);
      console.log('response:')
      console.log(response)
      expect(response).to.not.be.empty;
      expect(response.statusCode).to.be.equal('200');

    });
  });
  it('implement tests here', async () => {
    const response = await wrapped.run({});
    
    expect(response).to.not.be.empty;
  });

  await DynamoDbLocal.stopChild(child); // must be wrapped in async function
});
