const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_PROMPT = `You are an intense, unforgiving coach with the Mamba Mentality. Evaluate this user's time tracking data. If actual time < planned time, deliver a harsh reality check and an athlete quote. If they exceeded goals, push them harder. Keep it under 50 words.`;

// Fallback quotes when no API key is available
const FALLBACK_QUOTES = [
  "Rest at the end, not in the middle. You planned it, now execute it. No excuses. — Kobe Bryant",
  "You're not tired. You're uninspired. Get up and grind until the numbers match. Champions don't take breaks.",
  "Those hours you wasted? Someone else used them to get ahead. The scoreboard doesn't lie. Lock in.",
  "Great things come from hard work and perseverance. No excusing. Your data shows gaps. Fill them. — Kobe",
  "Excuses are the nails that build a house of failure. Your actual time tells the truth. Step up.",
  "The moment you give up is the moment you let someone else win. Your numbers say you quit early.",
  "I don't care about your feelings. I care about your results. And right now? They're not enough.",
  "Everything negative - pressure, challenges - is an opportunity to rise. You exceeded targets. Now double them.",
];

async function generateCoachResponse(activitiesData) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Format activity data for the prompt
  const dataStr = activitiesData
    .map(
      (a) =>
        `${a.name} (${a.category}): Planned ${a.plannedMinutes}min, Actual ${a.actualMinutes}min — ${a.status}`
    )
    .join('\n');

  const userPrompt = `Here is my time tracking data:\n${dataStr}\n\nGive me your assessment.`;

  // If no API key, return a contextual fallback
  if (!apiKey) {
    console.log('[Gemini] No API key — using fallback quote');
    const totalPlanned = activitiesData.reduce((s, a) => s + a.plannedMinutes, 0);
    const totalActual = activitiesData.reduce((s, a) => s + a.actualMinutes, 0);

    if (totalActual >= totalPlanned) {
      return "You hit your targets. Good. But 'good' isn't great. Push the ceiling higher. Champions never settle. — Mamba Mentality";
    }

    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini] API error:', error.message);
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
}

module.exports = { generateCoachResponse };
