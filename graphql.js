const { ApolloServer, gql } = require('apollo-server-lambda');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = "OTFUser";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
      email: String!
      firstName: String
      lastName: String
      middleInitial: String
      phone: String
      gender: Gender
  }
  enum Gender {
      Male
      Female
      Other
  }
  type Query {
    users: [User]
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    users: () => {return await dynamo.scan({ TableName: USER_TABLE }).promise();},
  },
};

const server = new ApolloServer({ typeDefs, resolvers, csrfPrevention: true });

exports.graphqlHandler = server.createHandler();