const express = require('express');
const router = express.Router();
const { generateCoachResponse } = require('../services/gemini');
const { synthesizeSpeech } = require('../services/elevenlabs');

// POST /api/coach/analyze — Analyze performance data
router.post('/analyze', async (req, res) => {
  try {
    const { activities } = req.body;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ error: 'activities array is required and must not be empty' });
    }

    // Step 1: Get motivational text from Gemini
    const coachText = await generateCoachResponse(activities);

    // Step 2: Get audio from ElevenLabs
    const audioBuffer = await synthesizeSpeech(coachText);

    // Return both text and audio
    res.json({
      text: coachText,
      audio: audioBuffer ? audioBuffer.toString('base64') : null,
      audioType: audioBuffer ? 'audio/mpeg' : null,
    });
  } catch (error) {
    console.error('[Coach] Analyze error:', error.message);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

module.exports = router;
