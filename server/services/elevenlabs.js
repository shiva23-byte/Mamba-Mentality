const axios = require('axios');

async function synthesizeSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default: Adam voice

  if (!apiKey) {
    console.log('[ElevenLabs] No API key — returning null (frontend will use SpeechSynthesis fallback)');
    return null;
  }

  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      data: {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.85,
          style: 0.6,
          use_speaker_boost: true,
        },
      },
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  } catch (error) {
    console.error('[ElevenLabs] TTS error:', error.message);
    return null;
  }
}

module.exports = { synthesizeSpeech };
