import React from "react";
import { Link } from "react-router-dom";

export const SignIn = () => {
	return (
		<>
			<Link to="/">
						<button type="submit">Home</button>
					</Link>
			<h1>Sign In</h1>
			<form className="check-in-field">
				<label>Username:</label>
				<input type="text" name="name" placeholder="Boogey"></input>
				<label>Password:</label>
				<input type="text" name="password" placeholder="********"></input>
				<label htmlFor="zip">Zip Code:</label>
				<input type="text" placeholder="12345"></input>
				<button type="submit">Submit</button>
			</form>
		</>
	);
};
