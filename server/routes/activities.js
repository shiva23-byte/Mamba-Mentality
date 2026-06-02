const express = require('express');
const router = express.Router();
const UserDay = require('../models/UserDay');

// Helper: Get week number of the month for a date
function getWeekOfMonth(dateStr) {
  const date = new Date(dateStr);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
}

// Helper: Get month string from date
function getMonthString(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// GET /api/activities/:date — Get single day's activities
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    let day = await UserDay.findOne({ date });

    if (!day) {
      // Return empty day structure
      return res.json({
        date,
        month: getMonthString(date),
        week: getWeekOfMonth(date),
        activities: [],
      });
    }

    res.json(day);
  } catch (error) {
    console.error('[Activities] GET /:date error:', error.message);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// GET /api/activities/range/:start/:end — Get activities for a date range
router.get('/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    const days = await UserDay.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    res.json(days);
  } catch (error) {
    console.error('[Activities] GET /range error:', error.message);
    res.status(500).json({ error: 'Failed to fetch activities range' });
  }
});

// POST /api/activities — Add activity to a day (creates day doc if needed)
router.post('/', async (req, res) => {
  try {
    const { date, activity } = req.body;

    if (!date || !activity) {
      return res.status(400).json({ error: 'date and activity are required' });
    }

    let day = await UserDay.findOne({ date });

    if (!day) {
      day = new UserDay({
        date,
        month: getMonthString(date),
        week: getWeekOfMonth(date),
        activities: [],
      });
    }

    day.activities.push(activity);
    await day.save();

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('activity-updated', { date, day });
    }

    res.status(201).json(day);
  } catch (error) {
    console.error('[Activities] POST error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/activities/:date/:activityId — Update an activity
router.patch('/:date/:activityId', async (req, res) => {
  try {
    const { date, activityId } = req.params;
    const updates = req.body;

    const day = await UserDay.findOne({ date });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const activity = day.activities.id(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== '_id') {
        activity[key] = updates[key];
      }
    });

    await day.save(); // pre-save hook recalculates status

    if (req.app.get('io')) {
      req.app.get('io').emit('activity-updated', { date, day });
    }

    res.json(day);
  } catch (error) {
    console.error('[Activities] PATCH error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/activities/:date/:activityId — Remove an activity
router.delete('/:date/:activityId', async (req, res) => {
  try {
    const { date, activityId } = req.params;

    const day = await UserDay.findOne({ date });
    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    const activity = day.activities.id(activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    activity.deleteOne();
    await day.save();

    if (req.app.get('io')) {
      req.app.get('io').emit('activity-updated', { date, day });
    }

    res.json(day);
  } catch (error) {
    console.error('[Activities] DELETE error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
