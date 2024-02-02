import { Link } from "react-router-dom"
import React, { ComponentProps, useState } from "react";
import { Requests } from "./api";

export function RegisterInput({
	labelText,
	inputProps,
}: {
	labelText: string;
	inputProps: ComponentProps<"input">;
}) {
	return (
		<div className="input-wrap">
			<label>{labelText}:</label>
			<input {...inputProps} />
		</div>
	);
}
 

export const Register = () => {
const [register, setRegister] = useState({username: "", password: "", confirm: "",zipcode: ""});
const handleRegister = (e: React.FormEvent) => {
	e.preventDefault();
	console.log(register);

  Requests.register(register.username, register.password, register.zipcode)
 
 
.catch((error) => {
	console.log("Response received:", error);
  console.error("Fetch error:", error.message);
});};



	return (
		<>
			<Link to="/">
				<button type="submit">Home</button>
			</Link>
			<form className="check-in-field" onSubmit={handleRegister}>
				<RegisterInput
				labelText="Username"
				inputProps={{
					placeholder: "Boogey",
					onChange: (e) => setRegister({ ...register, username: e.target.value }),
					value: register.username,
				}}
				/>
				<RegisterInput
				labelText="Password"
				inputProps={{
					placeholder: "Password",
					onChange: (e) => setRegister({ ...register, password: e.target.value }),
					value: register.password,
				}}
				/>
				<RegisterInput
				labelText="Confirm Password"
				inputProps={{
					placeholder: "Confirm Password",
					onChange: (e) => setRegister({ ...register, confirm: e.target.value }),
					value: register.confirm,
				}}
				/>
				<RegisterInput
				labelText="Zip Code"
				inputProps={{
					placeholder: "12345",
					onChange: (e) => setRegister({ ...register, zipcode: e.target.value }),
					value: register.zipcode,
				}}
				/>

				<button type="submit">Submit</button>
			</form>
		</>
	);
};
