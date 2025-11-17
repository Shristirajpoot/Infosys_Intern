// Fix MongoDB indexes
const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the problematic index in applications collection
    try {
      await db.collection('applications').dropIndex('opportunity_id_1_volunteer_id_1');
      console.log('Dropped old index: opportunity_id_1_volunteer_id_1');
    } catch (error) {
      console.log('Index opportunity_id_1_volunteer_id_1 not found or already dropped');
    }

    // Create the correct index
    await db.collection('applications').createIndex(
      { opportunityId: 1, volunteerId: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new index: opportunityId_1_volunteerId_1 with sparse option');

    // Clear any invalid application documents with null values
    const result = await db.collection('applications').deleteMany({
      $or: [
        { opportunityId: null },
        { volunteerId: null },
        { opportunityId: { $exists: false } },
        { volunteerId: { $exists: false } }
      ]
    });
    console.log(`Removed ${result.deletedCount} invalid application documents`);

    console.log('Database indexes fixed successfully!');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndexes();
