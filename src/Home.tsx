import { Link } from "react-router-dom";

export default function Home() {
	return (
		<>
			<div className="topnav">
				<h1>
					<span>Con</span>

					<span>Census</span>
				</h1>

				<div className="topnav-right">
					<Link to="/Signin">
						<button type="submit">Sign In</button>
					</Link>
					<Link to="/Register">
						<button type="submit">Register</button>
					</Link>
				</div>
			</div>

			<div id="detail"></div>
		</>
	);
}
