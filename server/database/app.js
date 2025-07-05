const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

// Mongoose Models
const Dealership = require('./dealership');
const Review = require('./review');

// Middleware
app.use(cors());
app.use(express.json()); // For JSON request bodies

// Load JSON data
const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

// Connect to MongoDB
mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' });

// Seed Database
async function seedDatabase() {
  try {
    await Review.deleteMany({});
    await Review.insertMany(reviews_data['reviews']);

    await Dealership.deleteMany({});
    await Dealership.insertMany(dealerships_data['dealerships']);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
seedDatabase();

// Routes
app.get('/test', (req, res) => {
  res.send("✅ This is the UPDATED code");
});

// Home route
app.get('/', (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Review.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Review.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealership.find();
    res.json(dealers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const dealers = await Dealership.find({ state });
    res.json(dealers);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Fetch single dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    console.log("Dealer ID:", dealerId);
    const dealer = await Dealership.findOne({ id: dealerId });
    console.log("Dealer found:", dealer);
    if (!dealer) return res.status(404).send("Dealer not found");
    res.json(dealer);
  } catch (err) {
    console.error("Error fetching dealer:", err);
    res.status(500).send(err.message);
  }
});


// Insert a new review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body);
    const documents = await Review.find().sort({ id: -1 });
    const new_id = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Review({
      id: new_id,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
