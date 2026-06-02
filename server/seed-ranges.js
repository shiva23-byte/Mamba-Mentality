require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const UserDay = require('./models/UserDay');

// Bypass restricted networks by forcing Google DNS for the SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

const phase1Activities = [
  { name: 'Morning Fuel', category: 'Fitness', plannedMinutes: 30, timeRange: '06:00 to 06:30' },
  { name: 'Deep Study: PDF Mastery', category: 'Education', plannedMinutes: 150, timeRange: '06:30 to 09:00' },
  { name: 'The Iron: Bodybuilding', category: 'Fitness', plannedMinutes: 180, timeRange: '09:00 to 12:00' },
  { name: 'Reset: Meal + Cold Shower', category: 'Fitness', plannedMinutes: 90, timeRange: '12:00 to 13:30' },
  { name: 'Trading: Analysis & Risk', category: 'Work', plannedMinutes: 90, timeRange: '13:30 to 15:00' },
  { name: 'Content: Script/Record/Edit', category: 'Project', plannedMinutes: 60, timeRange: '15:00 to 16:00' },
  { name: 'Secondary Skills: MERN/SAP + Prep', category: 'Education', plannedMinutes: 180, timeRange: '16:00 to 19:00' },
  { name: 'Work Shift: Full Focus', category: 'Work', plannedMinutes: 270, timeRange: '19:00 to 23:30' }
];

const phase2Activities = [
  { name: 'Morning Fuel', category: 'Fitness', plannedMinutes: 30, timeRange: '06:00 to 06:30' },
  { name: 'Deep Study: PDF Mastery', category: 'Education', plannedMinutes: 180, timeRange: '06:30 to 09:30' },
  { name: 'The Iron: Bodybuilding', category: 'Fitness', plannedMinutes: 180, timeRange: '09:30 to 12:30' },
  { name: 'Reset: Meal + Cold Shower', category: 'Fitness', plannedMinutes: 90, timeRange: '12:30 to 14:00' },
  { name: 'Trading: Full Market Session', category: 'Work', plannedMinutes: 150, timeRange: '14:00 to 16:30' },
  { name: 'Content: High-Yield Production', category: 'Project', plannedMinutes: 90, timeRange: '16:30 to 18:00' },
  { name: 'Secondary Skills: MERN/SAP Mastery', category: 'Education', plannedMinutes: 210, timeRange: '18:00 to 21:30' },
  { name: 'Decompression & Reading', category: 'Education', plannedMinutes: 60, timeRange: '21:30 to 22:30' }
];

function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4
    });
    console.log('Connected to MongoDB');

    // 1. Clear database completely
    await UserDay.deleteMany({});
    console.log('Cleared existing UserDay data');

    // Helper to add days
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const documents = [];

    // 2. Seed Phase 1: May 31, 2026 to Jun 4, 2026
    let currentDate = new Date('2026-05-31');
    const phase1End = new Date('2026-06-04');
    
    while (currentDate <= phase1End) {
      const dateStr = currentDate.toISOString().split('T')[0];
      documents.push({
        date: dateStr,
        month: String(currentDate.getMonth()),
        week: getWeekOfMonth(currentDate),
        activities: phase1Activities.map(a => ({ ...a, actualMinutes: 0 }))
      });
      currentDate = addDays(currentDate, 1);
    }
    console.log(`Generated Phase 1 tasks from 2026-05-31 to 2026-06-04`);

    // 3. Seed Phase 2: Jun 5, 2026 to Nov 5, 2026
    currentDate = new Date('2026-06-05');
    const phase2End = new Date('2026-11-05');
    
    while (currentDate <= phase2End) {
      const dateStr = currentDate.toISOString().split('T')[0];
      documents.push({
        date: dateStr,
        month: String(currentDate.getMonth()),
        week: getWeekOfMonth(currentDate),
        activities: phase2Activities.map(a => ({ ...a, actualMinutes: 0 }))
      });
      currentDate = addDays(currentDate, 1);
    }
    console.log(`Generated Phase 2 tasks from 2026-06-05 to 2026-11-05`);

    // Insert all documents
    await UserDay.insertMany(documents);
    console.log(`Successfully inserted ${documents.length} days of scheduled activities.`);

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
