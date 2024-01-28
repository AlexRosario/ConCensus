export const Register = () => {
	return (
		<>
			<form className="check-in-field">
				<label>Username:</label>
				<input type="text" name="name" placeholder="Boogey"></input>
				<label>Password:</label>
				<input type="text" name="password" placeholder="********"></input>
				<label>Confirm Password:</label>
				<input type="text" name="password" placeholder="********"></input>
				<button type="submit">Submit</button>
			</form>
		</>
	);
};
