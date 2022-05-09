const USER_TABLE = "OTFUser";
class Users {
    constructor(db) {
      this.db = db;
    }

    getUsers = async(filter) => {
        const params = {
            TableName: USER_TABLE,
        }
        const response =  await this.db.scan(params).promise();
        return response;
    }
    
    deleteUser = async(id) => {
        const data = id;
        const params = {
            TableName: USER_TABLE,
            Key: {email: data.key}
        }
        const response = await this.db.delete(params).promise();
        return response;
    }
    
    putUser = async(user) => {
        const params = {
            TableName: USER_TABLE,
            Item: user,
        }
    
        const response =  await this.db.put(params).promise();
        return response;
    }
    
    updateUser = async (request) => {
        const data = request;
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
    
        const response =  await this.db.update(params).promise();
        return response;
    }
    
  }
  module.exports = Users;