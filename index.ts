import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import { CognitoService } from './services/cognito.service';
import { requireAuth } from './middleware/requireAuth';


const app: Express = express();

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World From the Typescript Server!')
});

const port = 8000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});


interface FormInputs {
    email: string,
    password: string
  }

  // Array of example users for testing purposes
  const users = [
    {
      id: 1,
      name: 'Maria Doe',
      email: 'maria@example.com',
      password: 'maria123'
    },
    {
      id: 2,
      name: 'Juan Doe',
      email: 'juan@example.com',
      password: 'juan123'
    }
  ];


app.post('/signup', async (request: Request, response: Response) => {
  const { username, name, password, email } = request.body;
  const srv = new CognitoService();
  const responseSingup = (await srv.signup(username, password, name, email)) as any;
  //TODO: Check the user email exists

  response.status(responseSingup.details.$metadata.httpStatusCode).send(responseSingup);
});

app.post('/signin', async (request: Request, response: Response) => {
  const { username, password } = request.body;
  console.log(username);
  console.log(password);
  const srv = new CognitoService();
  const signinResponse = await srv.signIn(username, password);
  if (!signinResponse) {
      return response.status(404).send('User Not Found!')
    }

  return response.status(signinResponse?.$metadata.httpStatusCode || 400).json(signinResponse?.ChallengeParameters?.["USER_ID_FOR_SRP"]);
});


