const mongoose = require('mongoose');
require('dotenv').config();

const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/admin-portal';
console.log('Connecting to:', dbUri);
mongoose.connect(dbUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAll collections:');
    collections.forEach(c => console.log('  -', c.name));
    
    // Check bookings collection
    const bookingsCount = await db.collection('bookings').countDocuments();
    console.log('\nBookings count:', bookingsCount);
    
    if (bookingsCount > 0) {
      const bookings = await db.collection('bookings').find().limit(2).toArray();
      console.log('\nSample bookings:');
      console.log(JSON.stringify(bookings, null, 2));
    }
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
