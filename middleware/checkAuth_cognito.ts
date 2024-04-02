import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const REGION = 'your_aws_region';
const USER_POOL_ID = 'eu-north-1_WwUBFcaIZ';
const CLIENT_ID = 'your_client_id';

type DecodedToken = {
  header: JwtHeader;
  payload: any;
  signature: string;
};

async function validateToken(token: string): Promise<any> {
  // Decode the JWT token without verifying to get kid for key lookup
  const decodedToken: DecodedToken = jwt.decode(token, { complete: true }) as DecodedToken;
  console.log(decodedToken);
  if (!decodedToken?.header) {
    throw new Error('Invalid token');
  }

  const jwksUri = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

  const client = jwksClient({
    cache: true,
    jwksUri: jwksUri,
  });

  // Get signing key
  const getSigningKey = (header: JwtHeader, callback: SigningKeyCallback) => {
    return client.getSigningKey(header.kid as string, (error, key) => {
      if (error) {
        callback(error, undefined);
      } else {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      }
    });
  };

  // Verify the token
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: CLIENT_ID,
        issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
        algorithms: ['RS256'],
      },
      (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

const checkAuthCognito = async (request: Request, response: Response, next: NextFunction) => {
  if (!request.headers.authorization) {
    return next();
  }
  try {
    const tokenBearer = request.headers.authorization.split(' ')[1];
  
    const resultValidation = await validateToken(tokenBearer);
    
    //resultValidation returns current user data (as a token we should use IdToken to get all of the details about the user)
    request.user = {
      id: resultValidation.sub,
      name: resultValidation.name,
      email: resultValidation.email,
      roles: resultValidation['cognito:groups'],
    };
  } catch (error) {}

  next();
};

//Typescript way to define user field under the express Request.
declare global {
  namespace Express {
    interface Request {
      user: { name: string; email: string; id: string; roles: Array<string> };
    }
  }
}
export { checkAuthCognito };