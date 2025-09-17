const express = require('express'); // dependencies
const fetch = require('node-fetch');
const cors = require('cors');

const app = express(); //express app instance
const PORT = 3000;

app.use(cors()); // cors thing for apps to access this

let cachedUsers = []; // fetched user data cache


async function fetchUsersFromAPI() { //Fetch and cache user info
    try {
        const response = await fetch('https://randomuser.me/api/?results=1000');
        const data = await response.json();
        cachedUsers = data.results; // store data into cache
        console.log('✅ Cached 1000 fresh users from Random User API.');
    } catch (error) {
        console.error('❌ Failed to fetch users:', error);
    }
}

// Root: return 1 or multiple users
app.get('/api', async (req, res) => {
    await fetchUsersFromAPI(); // always regenerate new users before responding

    const results = parseInt(req.query.results) || 1;
    if (!cachedUsers.length) {
        return res.status(500).json({ error: "No users available. Try again." });
    }

    if (results === 1) {
        const randomUser = cachedUsers[Math.floor(Math.random() * cachedUsers.length)];
        return res.json({ results: [randomUser] }); // return single random user
    }

    return res.json({ results: cachedUsers.slice(0, results) }); //return many users
});

app.listen(PORT, async () => { //start server
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await fetchUsersFromAPI(); // fetch when server starts
});
