
  import { useState, ChangeEvent, FormEvent } from "react";
  import { ReactComponent as Logo } from "./logo.svg";
  import { getData } from "./utils/data-utils";
  import FormInput from './components/form-input/form-input';

  import './App.css';

  // TypeScript declarations
  type User = {
    name: string,
  }

  const defaultFormFields = {
    username: '',
    password: '',
  }

  const App = () => {
    // react hooks
    const [user, setUser] = useState<User | null>()
    const [formFields, setFormFields] = useState(defaultFormFields)
    const { username, password } = formFields

    const resetFormFields = () => {
      return (
        setFormFields(defaultFormFields)
      );
    }

    // handle input changes
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      setFormFields({...formFields, [name]: value })
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      try {
        // make the API call
        const res:string= await getData(
          'http://localhost:8000/signin', username, password
        )
        console.log(res)
        setUser({name: res});
        resetFormFields()
      } catch (error) {
        alert('User Sign In Failed');
      }
    };

    const reload = () => {
      setUser(null);
      resetFormFields()
    };

    return (
      <div className='App-header'>
        <h1>
          { user && `Welcome! ${user.name}`}
        </h1>
        <div className="card">
          <Logo className="logo" />
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <FormInput
              label="username"
              type="username"
              required
              name="username"
              value={username}
              onChange={handleChange}
            />
            <FormInput
              label="Password"
              type='password'
              required
              name='password'
              value={password}
              onChange={handleChange}
            />
            <div className="button-group">
              <button type="submit">Sign In</button>
              <span>
                <button type="button" onClick={reload}>Clear</button>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default App;
  