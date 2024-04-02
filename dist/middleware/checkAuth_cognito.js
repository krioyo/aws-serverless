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
exports.checkAuthCognito = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const REGION = 'your_aws_region';
const USER_POOL_ID = 'eu-north-1_WwUBFcaIZ';
const CLIENT_ID = 'your_client_id';
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        // Decode the JWT token without verifying to get kid for key lookup
        const decodedToken = jsonwebtoken_1.default.decode(token, { complete: true });
        console.log(decodedToken);
        if (!(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.header)) {
            throw new Error('Invalid token');
        }
        const jwksUri = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
        const client = (0, jwks_rsa_1.default)({
            cache: true,
            jwksUri: jwksUri,
        });
        // Get signing key
        const getSigningKey = (header, callback) => {
            return client.getSigningKey(header.kid, (error, key) => {
                if (error) {
                    callback(error, undefined);
                }
                else {
                    const signingKey = key === null || key === void 0 ? void 0 : key.getPublicKey();
                    callback(null, signingKey);
                }
            });
        };
        // Verify the token
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, getSigningKey, {
                audience: CLIENT_ID,
                issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
                algorithms: ['RS256'],
            }, (error, decoded) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(decoded);
                }
            });
        });
    });
}
const checkAuthCognito = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!request.headers.authorization) {
        return next();
    }
    try {
        const tokenBearer = request.headers.authorization.split(' ')[1];
        const resultValidation = yield validateToken(tokenBearer);
        //resultValidation returns current user data (as a token we should use IdToken to get all of the details about the user)
        request.user = {
            id: resultValidation.sub,
            name: resultValidation.name,
            email: resultValidation.email,
            roles: resultValidation['cognito:groups'],
        };
    }
    catch (error) { }
    next();
});
exports.checkAuthCognito = checkAuthCognito;
