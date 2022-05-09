'use strict';
const Users = require('../user');
const { default: axios } = require('axios');
const AWS = require('aws-sdk');
const mochaPlugin = require('serverless-mocha-plugin');
const expect = mochaPlugin.chai.expect;

describe('OTF User Test', async () => {
  let randomUser;
  let modified;
  let userAPI;

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

    const db = new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });

    userAPI = new Users(db);
  });

  describe('test logic', () => {
    it('test post', async () => {
      const response = await userAPI.putUser(randomUser);
      expect(response).to.be.empty;
    });

    it('test get', async () => {
      const users = await userAPI.getUsers();
      expect(users).to.not.be.empty;
      expect(users.Items).to.not.be.empty;
      expect(users.Items).to.deep.include.members([randomUser]);
    });

    it('test put', async ()=> {
      const modifiedName = 'test';
      modified = {...randomUser};
      delete modified.email;
      modified.firstName = modifiedName;

      const response = await userAPI.updateUser({
        key: randomUser.email,
        data: modified});

      expect(response).to.not.be.empty;
      expect(response.Attributes).to.not.be.empty;
      expect(response.Attributes.firstName).to.be.equal(modifiedName);

    });

    it('test delete', async () => {
      const response = await userAPI.deleteUser({
        key: randomUser.email,
      });

      const users = await userAPI.getUsers();
      expect(response).to.be.empty;
      expect(users.Items).to.not.deep.include.members([randomUser]);
    });
  });

  //TODO test error cases (invalid data types, values etc)
});
