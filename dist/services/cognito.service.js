"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoService = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CognitoService {
    constructor() {
        this.config = {
            region: 'eu-north-1'
        };
        this.userPoolId = process.env.USER_POOL_ID;
        this.clientId = process.env.CLIENT_ID;
        this.secretHash = process.env.CLIENT_SECRET;
        this.cognitoIdentity = new client_cognito_identity_provider_1.CognitoIdentityProviderClient(this.config);
    }
    signup(username, password, name, email) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const signupCommand = new client_cognito_identity_provider_1.SignUpCommand(input);
                const response = yield this.cognitoIdentity.send(signupCommand);
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
            }
            catch (error) {
                const awsError = error;
                let message;
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
        });
    }
    signIn(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    AuthFlow: 'USER_PASSWORD_AUTH',
                    ClientId: this.clientId,
                    AuthParameters: {
                        USERNAME: username,
                        PASSWORD: password,
                        SECRET_HASH: this.hashSecret(username),
                    },
                };
                const command = new client_cognito_identity_provider_1.InitiateAuthCommand(params);
                const response = yield this.cognitoIdentity.send(command);
                return response;
            }
            catch (error) {
                console.log('Error occurred while signing in:', error);
            }
        });
    }
    hashSecret(username) {
        return crypto_1.default
            .createHmac('SHA256', this.secretHash)
            .update(username + this.clientId)
            .digest('base64');
    }
}
exports.CognitoService = CognitoService;
