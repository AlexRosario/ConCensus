/* eslint-disable no-mixed-spaces-and-tabs */
import { Link } from "react-router-dom";
import { Requests } from "./api.tsx";
import React, { useEffect, useState } from 'react';


interface CongressMember {
	name: string;
	party: string;
	state: string;
	district: string;
	phone: string;
	office: string;
	link: string;
  }
export default function Home() {

	const [congress, setCongress] = useState<CongressMember[]>([]);

	useEffect(() => {

	  Requests.getCongressMembers("11207")
	  	
		.then((data) => {
	console.log("Data received:", data);
		 return setCongress(data.results); 

		})  .catch((error) => {
			console.error("Fetch error:", error.message); // Display the error message
			if (error.response) {
			  // Check if a response exists
			  console.error("Response status:", error.response.status);
			  console.error("Response text:", error.response.statusText);
			}
		  });
	
	}, []); 
	console.log(congress);

	return (
		
		<>
			<div className="topnav">
				<h1>
					<span>DE</span>
					<span>LEGATOR</span>
				</h1>

				<div className="topnav-right">
					<Link to="/Signin">
						<button type="submit">Sign In</button>
					</Link>
					<div className="topnav-register">
						<Link to="/Register">
							<button type="submit">Register</button>
						</Link>
						<span>Not a member yet?</span>
					</div>
				</div>
			</div>

			<div>
				<h1>Find your representatives</h1>
				<ul>
{congress.map((member, index) => (
    <li key={index}>{member.name}</li>
  ))}
</ul>
			</div>
		</>
	);
}