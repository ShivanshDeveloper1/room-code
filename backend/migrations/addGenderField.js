require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateGenderField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('Connected to MongoDB for migration');

    // Find all users who don't have gender field
    const usersWithoutGender = await User.find({
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: undefined }
      ]
    });

    console.log(`Found ${usersWithoutGender.length} users without gender field`);

    if (usersWithoutGender.length === 0) {
      console.log('No users need migration. All users already have gender field.');
      return;
    }

    // Update all users to have default empty gender field
    const updateResult = await User.updateMany(
      {
        $or: [
          { gender: { $exists: false } },
          { gender: null },
          { gender: undefined }
        ]
      },
      {
        $set: {
          gender: '',
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Users found without gender: ${usersWithoutGender.length}`);
    console.log(`📊 Users updated: ${updateResult.modifiedCount}`);

    // Verify the migration
    const remainingUsersWithoutGender = await User.find({
      $or: [
        { gender: { $exists: false } },
        { gender: null },
        { gender: undefined }
      ]
    });

    console.log(`🔍 Remaining users without gender: ${remainingUsersWithoutGender.length}`);

    if (remainingUsersWithoutGender.length === 0) {
      console.log('🎉 All users now have gender field!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the migration
migrateGenderField();
