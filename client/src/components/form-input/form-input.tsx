import { InputHTMLAttributes, FC } from "react";


  type FromInputProps = { label: string } &
    InputHTMLAttributes<HTMLInputElement>;

  const FormInput: FC<FromInputProps> = ({ label, ...otherProps }) => {
    return (
      <div className="group">
        <input {...otherProps} />
        {
          label &&
          <div >
            {label}
          </div>
        }
      </div>
    );
  }

  export default FormInput;
  