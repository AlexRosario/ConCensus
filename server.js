
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import cors from 'cors';



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




app.post('/users', (req, res) => {
  
  try {
    const { username, password, zipcode } = req.body;
    console.log('Request received:', req.body);
    let db = { users: [] };

    if (fs.existsSync('db.json')) {
      const fileData = fs.readFileSync('db.json', 'utf8');
      db = JSON.parse(fileData);
    }

    db.users.push({ username, password, zipcode });
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

    res.status(200).json({ status: 'success', message: 'Registration successful' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});



// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});