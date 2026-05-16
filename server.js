require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Destination } = require('./schemas');
const { logger } = require('./auth');

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());
app.use(logger);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/travelmate";
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log(">>> [SUCCESS] Connected securely to MongoDB.");
        await seedDatabase();
    })
    .catch(err => console.error(">>> [CRITICAL] MongoDB connection error:", err));

// Auto-Seeding Dataset Engine
async function seedDatabase() {
    try {
        const count = await Destination.countDocuments();
        if (count === 0) {
            console.log("[Seeder] Destinations collection is empty. Populating dataset items...");
            const initialDestinations = [
                {
                    "id": "bali",
                    "title": "Ubud Wellness Retreat",
                    "desc": "Experience the spiritual heart of Bali with private jungle villas and traditional holistic healing.",
                    "img": "bali.webp",
                    "weather": "Humid 30°C",
                    "dining": "Locavore",
                    "season": "April - October"
                },
                {
                    "id": "egypt",
                    "title": "The Eternal Nile",
                    "desc": "A journey through time featuring private tours of the Giza Pyramids and luxury Nile cruises.",
                    "img": "egypt.jpg",
                    "weather": "Dry 35°C",
                    "dining": "1886 Restaurant",
                    "season": "October - April"
                },
                {
                    "id": "santorini",
                    "title": "Oia Sunset Escape",
                    "desc": "Iconic white-washed architecture overlooking the Aegean Sea with world-class cave suites.",
                    "img": "santorini.jpg",
                    "weather": "Sunny 28°C",
                    "dining": "Ambrosia",
                    "season": "May - September"
                },
                {
                    "id": "safari",
                    "title": "Serengeti Luxury Safari",
                    "desc": "Unparalleled wildlife viewing from the comfort of high-end canvas tents under the stars.",
                    "img": "safari.webp",
                    "weather": "Mild 24°C",
                    "dining": "Bush Dinner",
                    "season": "June - October"
                },
                {
                    "id": "cappadocia",
                    "title": "Anatolian Skies",
                    "desc": "Wake up to hundreds of hot air balloons over the 'Fairy Chimneys' in historical cave dwellings.",
                    "img": "cappadocia.webp",
                    "weather": "Breezy 22°C",
                    "dining": "Seki Restaurant",
                    "season": "April - June"
                },
                {
                    "id": "mediterranean",
                    "title": "Amalfi Coast Drive",
                    "desc": "Winding coastal roads, lemon groves, and historic villas perched on dramatic cliffs.",
                    "img": "mediterranean.jpg",
                    "weather": "Warm 26°C",
                    "dining": "La Sponda",
                    "season": "May - September"
                }
            ];
            await Destination.insertMany(initialDestinations);
            console.log(">>> [SUCCESS] All 6 luxury travel packages successfully seeded into MongoDB.");
        } else {
            console.log(`[Seeder] Found ${count} existing destination entries. Skipping database injection.`);
        }
    } catch (error) {
        console.error("Error checking or seeding database collections:", error);
    }
}

// REST Endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!email || !username) {
            return res.status(400).json({ error: "Missing identity credentials fields." });
        }

        let user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({ username, email, password: hashedPassword });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ token, user: { username: user.username, email: user.email } });
    } catch (error) {
        console.error("Auth server error context:", error);
        res.status(500).json({ error: "Internal Auth Routine Defect" });
    }
});

app.get('/api/destinations', async (req, res) => {
    try {
        const data = await Destination.find({});
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to read documents from cluster collection." });
    }
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` SERVER RUNNING SUCCESSFULLY ON PORT: ${PORT}      `);
    console.log(` Endpoints Available at http://localhost:${PORT}   `);
    console.log(`=================================================`);
});