import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import { SignIn } from "./Signin";
import { Register } from "./Register";
import App from "./App";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/App",
		element: <App />,
	},
	{
		path: "/Signin",
		element: <SignIn />,
	},
	{
		path: "/Register",
		element: <Register />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
