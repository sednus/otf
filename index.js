const AWS = require('aws-sdk');
const Users = require('./user');

const dynamo = new AWS.DynamoDB.DocumentClient();
const users = new Users(dynamo);

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));
    
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                body = await users.deleteUser(JSON.parse(event.body));
                break;
            case 'GET':
                body = await users.getUsers(JSON.parse(event.body));
                break;
            case 'POST':
                body = await users.putUser(JSON.parse(event.body));
                break;
            case 'PUT':
                body = await users.updateUser(JSON.parse(event.body));
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
