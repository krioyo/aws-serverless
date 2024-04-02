import cognito, {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import { Init } from 'v8';
import dotenv from "dotenv"
dotenv.config()

export class CognitoService {
  private config = {
    region: 'eu-north-1'
  };
  private userPoolId = process.env.USER_POOL_ID;
  private clientId = process.env.CLIENT_ID;
  private secretHash = process.env.CLIENT_SECRET;
  private cognitoIdentity: CognitoIdentityProviderClient;

  constructor() {
    this.cognitoIdentity = new CognitoIdentityProviderClient(this.config);
  }
  public async signup(username: string, password: string, name: string, email: string) {
    try {
      const input = {
        // SignUpRequest
        ClientId: this.clientId, // required
        SecretHash: this.hashSecret(username),
        Username: username, // required
        Password: password, // required
        UserAttributes: [
          // AttributeListType
          {
            // AttributeType
            Name: 'name',
            Value: name,
          },
          {
            // AttributeType
            Name: 'email',
            Value: email,
          },
          {
            // If you added any custom attribute to your user pool while creating it, you can assign value to it with using
            //prefix custom:<your_custom_field_name>
            Name: 'custom:tenant_id',
            Value: 'tenant_1',
          },
        ],
      };
      const signupCommand = new SignUpCommand(input);
      const response = await this.cognitoIdentity.send(signupCommand);
      return { message: 'Success', details: response };
      
      
      //NOTE: If you also want to assign a group to the user, you should use admin stuff commands, aws credentails needed.
      //Here is the example;
      /*
        const groupInput = {
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: 'member', // replace with your group name
      };
      const addToGroupCommand = new AdminAddUserToGroupCommand(groupInput);
      await this.cognitoIdentity.send(addToGroupCommand);
      */
    } catch (error) {
      const awsError = error as AWSError;
      let message: string;
      switch (awsError.name) {
        case 'UsernameExistsException':
          message = 'User already exists.';
          break;
        case 'InvalidParameterException':
          message = 'Invalid parameters provided';
          break;
        case 'TooManyRequestsException':
          message = 'Too many requests, please try again later';
          break;
        default:
          message = 'An unexpected error occurred';
      }
      return { message: message, details: awsError };
    }
  }

  public async signIn(username: string, password: string) {
    try {
      const params: InitiateAuthCommandInput = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
          SECRET_HASH: this.hashSecret(username),
        },
      };
      const command = new InitiateAuthCommand(params);
      const response = await this.cognitoIdentity.send(command);
      return response;
    } catch (error) {
      console.log('Error occurred while signing in:', error);
    }
  }

  private hashSecret(username: string): string {
    return crypto
      .createHmac('SHA256', this.secretHash!)
      .update(username + this.clientId)
      .digest('base64');
  }
}

interface AWSError extends Error {
  name: string; // Name of the exception
  $metadata: { httpStatusCode: number };
}