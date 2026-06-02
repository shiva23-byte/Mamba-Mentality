const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Activity name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Education', 'Fitness', 'Project', 'Work'],
      message: '{VALUE} is not a valid category',
    },
  },
  timeRange: {
    type: String,
    trim: true,
  },
  plannedMinutes: {
    type: Number,
    required: [true, 'Planned minutes is required'],
    min: [1, 'Planned minutes must be at least 1'],
  },
  actualMinutes: {
    type: Number,
    default: 0,
    min: [0, 'Actual minutes cannot be negative'],
  },
  status: {
    type: String,
    enum: ['completed', 'lagging', 'in-progress'],
    default: 'in-progress',
  },
}, { timestamps: true });

const userDaySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
  },
  month: {
    type: String,
    required: true,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
  },
  activities: [activitySchema],
}, { timestamps: true });

// Auto-calculate status before saving
userDaySchema.pre('save', function (next) {
  this.activities.forEach((activity) => {
    if (activity.actualMinutes >= activity.plannedMinutes) {
      activity.status = 'completed';
    } else if (activity.actualMinutes > 0) {
      activity.status = 'in-progress';
    } else {
      activity.status = 'lagging';
    }
  });
  next();
});

module.exports = mongoose.model('UserDay', userDaySchema);
