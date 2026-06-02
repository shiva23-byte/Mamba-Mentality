require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const UserDay = require('./models/UserDay');

// Bypass restricted networks by forcing Google DNS for the SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

const classWeekActivities = [
  { name: 'Wake up, stretch, fuel', category: 'Fitness', plannedMinutes: 30, timeRange: '05:30 AM to 06:00 AM' },
  { name: 'Deep Study (PDF)', category: 'Education', plannedMinutes: 120, timeRange: '06:00 AM to 08:00 AM' },
  { name: 'Fast breakfast & pack bag', category: 'Fitness', plannedMinutes: 40, timeRange: '08:00 AM to 08:40 AM' },
  { name: 'Commute: To Class Center', category: 'Education', plannedMinutes: 20, timeRange: '08:40 AM to 09:00 AM' },
  { name: 'Class Block: Note-taking', category: 'Education', plannedMinutes: 480, timeRange: '09:00 AM to 05:00 PM' },
  { name: 'Commute: To Gym', category: 'Fitness', plannedMinutes: 20, timeRange: '05:00 PM to 05:20 PM' },
  { name: 'The Iron: Evening Grind', category: 'Fitness', plannedMinutes: 180, timeRange: '05:20 PM to 08:20 PM' },
  { name: 'Commute: To Room', category: 'Fitness', plannedMinutes: 20, timeRange: '08:20 PM to 08:40 PM' },
  { name: 'Massive dinner & shower', category: 'Fitness', plannedMinutes: 50, timeRange: '08:40 PM to 09:30 PM' },
  { name: 'Trading: Levels & Journal', category: 'Work', plannedMinutes: 60, timeRange: '09:30 PM to 10:30 PM' },
  { name: 'Content Creation: Max efficiency', category: 'Project', plannedMinutes: 60, timeRange: '10:30 PM to 11:30 PM' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log('Connected to MongoDB');

    const startDate = new Date('2026-06-05');
    const endDate = new Date('2026-11-05');
    
    // Find all days in this range
    const days = await UserDay.find({
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      }
    });

    console.log(`Found ${days.length} days to update from June 5 to Nov 5.`);

    let updateCount = 0;
    for (const day of days) {
      day.activities = classWeekActivities.map(a => ({ ...a, actualMinutes: 0 }));
      await day.save();
      updateCount++;
    }

    console.log(`Successfully updated ${updateCount} days with the new "Class Week" schedule.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
