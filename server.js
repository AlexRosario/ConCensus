import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
export const proPublicaHeader = new Headers();
proPublicaHeader.append(
	'X-API-Key',
	'nymVg76FlGKy3VBdYBy96ZAYgk56fhvoYf8mUKmi'
);

const app = express();
app.use(express.json());

app.use(cors());
app.use(
	'/api',
	createProxyMiddleware({
		target: 'https://whoismyrepresentative.com',
		changeOrigin: true,
		pathRewrite: (path, req) => {
			const zip = req.url.split('zip=')[1];
			return `/getall_mems.php?zip=${zip}&output=json`;
		},
	})
);
app.use(
	'/googleCivic',
	createProxyMiddleware({
		target: 'https://www.googleapis.com',
		changeOrigin: true,
		pathRewrite: (path, req) => {
			const address = new URLSearchParams(req.url).get('address');

			return `/civicinfo/v2/representatives/?address=${address}`;
		},
		onProxyRes: (proxyRes, req, res) => {
			res.header('Access-Control-Allow-Origin', '*');
		},
	})
);
app.use(
	'/congress',
	createProxyMiddleware({
		target: 'https://api.congress.gov/v3/member',
		changeOrigin: true,

		onProxyRes: (proxyRes, req, res) => {
			res.header('Access-Control-Allow-Origin', '*');
		},
	})
);

app.get('/users', (req, res) => {
	if (fs.existsSync('db.json')) {
		const fileData = fs.readFileSync('db.json', 'utf8');
		const db = JSON.parse(fileData);
		res.json(db.users);
	} else {
		res.status(404).json({ status: 'error', message: 'No users found' });
	}
});

app.post('/users', (req, res) => {
	let id = uuid();
	try {
		const { username, email, password, address, representatives } = req.body;
		console.log('Request received:', req.body);
		let db = { users: [] };

		if (fs.existsSync('db.json')) {
			const fileData = fs.readFileSync('db.json', 'utf8');
			db = JSON.parse(fileData);
		}

		db.users.push({
			id,
			username,
			email,
			password,
			address,
			representatives,
			vote_log: {},
		});
		fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

		res
			.status(200)
			.json({ status: 'success', message: 'Registration successful' });
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({ status: 'error', message: 'Server error' });
	}
});
app.get('/representatives', (req, res) => {
	if (fs.existsSync('db.json')) {
		const fileData = fs.readFileSync('db.json', 'utf8');
		const db = JSON.parse(fileData);
		res.json(db.representatives);
	} else {
		res.status(404).json({ status: 'error', message: 'No reps found' });
	}
});

app.post('/representatives', (req, res) => {
	let id = uuid();
	try {
		const representative = req.body;
		console.log('Request received:', req.body);
		let db = { representatives: [] };

		if (fs.existsSync('db.json')) {
			const fileData = fs.readFileSync('db.json', 'utf8');
			db = JSON.parse(fileData);
		}

		db.representatives.push({ ...representative, id });
		fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

		res
			.status(200)
			.json({ status: 'success', message: 'Registration successful' });
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({ status: 'error', message: 'Server error' });
	}
});

app.patch('/users/:userId', (req, res) => {
	const { userId } = req.params;
	const readDB = () => {
		const dbData = fs.readFileSync('db.json', 'utf8');
		return JSON.parse(dbData);
	};

	// Helper function to write to the database file
	const writeDB = (data) => {
		fs.writeFileSync('db.json', JSON.stringify(data, null, 2), 'utf8');
	};
	const db = readDB();

	const userIndex = db.users.findIndex((user) => user.id === userId);
	if (userIndex === -1) {
		return res.status(404).send('User not found');
	}

	// Update user's vote log with new data
	const updatedVoteLog = {
		...db.users[userIndex].vote_log,
		...req.body.vote_log,
	};
	db.users[userIndex].vote_log = updatedVoteLog;

	writeDB(db);

	res.send('Vote log updated successfully');
});
// Start the Express server
const port = 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
