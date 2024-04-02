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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cognito_service_1 = require("./services/cognito.service");
const requireAuth_1 = require("./middleware/requireAuth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World From the Typescript Server!');
});
const port = 8000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
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
// route login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => {
        return user.email === email && user.password === password;
    });
    if (!user) {
        return res.status(404).send('User Not Found!');
    }
    return res.status(200).json(user);
});
app.post('/signup', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, password, email } = request.body;
    const srv = new cognito_service_1.CognitoService();
    const responseSingup = (yield srv.signup(username, password, name, email));
    //TODO: Check the user email exists
    response.status(responseSingup.details.$metadata.httpStatusCode).send(responseSingup);
}));
app.post('/signin', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = request.body;
    console.log(username);
    console.log(password);
    const srv = new cognito_service_1.CognitoService();
    const signinResponse = yield srv.signIn(username, password);
    response.status((signinResponse === null || signinResponse === void 0 ? void 0 : signinResponse.$metadata.httpStatusCode) || 400).send(signinResponse === null || signinResponse === void 0 ? void 0 : signinResponse.AuthenticationResult);
}));
app.get('/current-user', requireAuth_1.requireAuth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send(request.user);
}));
