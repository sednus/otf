const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = "OTFUser";


const getUsers = async(filter) => {
    const params = {
        TableName: USER_TABLE,
    }
    return await dynamo.scan(params).promise();
}

const deleteUser = async(id) => {
    const data = JSON.parse(id);
    const params = {
        TableName: USER_TABLE,
        Key: {email: data.key}
    }
    return await dynamo.delete(params).promise();
}

const putUser = async(user) => {
    const params = {
        TableName: USER_TABLE,
        Item: JSON.parse(user), //TODO va;idate item
    }

    return await dynamo.put(params).promise();
}

const updateUser = async (request) => {
    const data = JSON.parse(request);
    const item = data.data;

    let updateExpression='set';
    let expressionAttributeNames={};
    let expressionAttributeValues = {};
    for (const property in item) {
      updateExpression += ` #${property} = :${property} ,`;
      expressionAttributeNames['#'+property] = property ;
      expressionAttributeValues[':'+property]=item[property];
    }
    updateExpression= updateExpression.slice(0, -1);

    const params = {
        TableName: USER_TABLE,
        Key: {email: data.key},
        ReturnValues: 'ALL_NEW',
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
    }

    return await dynamo.update(params).promise();
}

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
                body = await deleteUser(event.body);
                break;
            case 'GET':
                body = await getUsers(event.body);
                break;
            case 'POST':
                body = await putUser(event.body);
                break;
            case 'PUT':
                body = await updateUser(event.body);
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
