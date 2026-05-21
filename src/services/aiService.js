import { getFunctions, httpsCallable } from 'firebase/functions';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';
const USE_PROXY = false; // Set to true once Cloud Functions are deployed

// ─── Direct call (dev) or proxy (production) ─────────────────────────────────
const callClaude = async (prompt, systemPrompt) => {
  if (USE_PROXY) {
    // Production — key stays server-side
    const functions = getFunctions();
    const generatePlan = httpsCallable(functions, 'generateTrainingPlan');
    const result = await generatePlan({ prompt, systemPrompt });
    return result.data.text;
  } else {
    // Dev — direct call with local key
    const response = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI request failed');
    }
    const data = await response.json();
    return data.content[0]?.text || '';
  }
};

export const generateAITrainingPlan = async ({ client, compDays, trainerNotes, athleteGoals, athleteFeel, coachNotes }) => {
  const grades = {
    Head: client.Head ?? 100,
    Arm: client.Arm ?? 100,
    Core: client.Core ?? 100,
    Leg: client.Leg ?? 100,
    Foot: client.Foot ?? 100,
  };

  const injuries = Object.entries(client.injuries || {})
    .filter(([_, v]) => v)
    .map(([part, _]) => `${part} (${client.injurySeverities?.[part] || 'Mild'})`)
    .join(', ') || 'None';

  const targets = Object.entries(client.targets || {})
    .filter(([_, v]) => v > 0)
    .map(([part, val]) => `${part}: target ${val}%`)
    .join(', ') || 'None set';

  const isSportPlayer = !!client.sport && client.sport.toLowerCase() !== 'general';

  const prompt = `You are an expert sports rehabilitation and performance coach AI assistant inside FitGrade, a professional trainer app.

CLIENT PROFILE:
- Name: ${client.name}
- Sport/Activity: ${client.sport || 'General fitness'}
- Age: ${client.age || 'Unknown'}
- Days until next competition/event: ${compDays}

CURRENT HEALTH GRADES (0-100, where 100 is perfect):
- Head (cognitive/focus): ${grades.Head}%
- Arm (upper body): ${grades.Arm}%
- Core (stability): ${grades.Core}%
- Leg (lower body): ${grades.Leg}%
- Foot (balance/mobility): ${grades.Foot}%
- Overall average: ${Math.round(Object.values(grades).reduce((a, b) => a + b, 0) / 5)}%

ACTIVE INJURIES: ${injuries}
TRAINER TARGETS: ${targets}
TRAINER NOTES: ${trainerNotes || 'None provided'}
COACH OBSERVATIONS: ${coachNotes || 'None provided'}
ATHLETE SELF-REPORTED FEEL (1-10): ${athleteFeel || 'Not reported'}
ATHLETE PERSONAL GOALS: ${athleteGoals || 'None entered'}

IMPORTANT: The trainer notes and coach observations above are critical inputs. If a trainer has flagged specific things to focus on or avoid, prioritize those instructions in the plan. If the coach has flagged tactical concerns, factor them into the recovery and intensity recommendations.

Based on this data, generate a personalized weekly training plan. Your response must be a JSON object with exactly this structure:
{
  "summary": "2-3 sentence plain English assessment of current state",
  "riskFlags": ["risk flag 1", "risk flag 2"],
  "weeklySchedule": [
    {"day": "Monday", "type": "Rest|Recovery|Light|Moderate|Intense", "focus": "what to do", "notes": "specific guidance"},
    {"day": "Tuesday", "type": "...", "focus": "...", "notes": "..."},
    {"day": "Wednesday", "type": "...", "focus": "...", "notes": "..."},
    {"day": "Thursday", "type": "...", "focus": "...", "notes": "..."},
    {"day": "Friday", "type": "...", "focus": "...", "notes": "..."},
    {"day": "Saturday", "type": "...", "focus": "...", "notes": "..."},
    {"day": "Sunday", "type": "...", "focus": "...", "notes": "..."}
  ],
  "nextSessionFocus": "What the trainer should focus on in the next session",
  "goalProgress": "Assessment of progress toward targets and athlete goals",
  "compReadiness": "${isSportPlayer ? 'Percentage ready for competition with explanation' : 'Progress toward workout completion goal'}"
}

Only respond with the JSON object, no other text.`;

  const systemPrompt = 'You are an expert sports rehabilitation and performance coach. Always respond with valid JSON only, no other text.';
  const text = await callClaude(prompt, systemPrompt);

  try {
    const clean = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return { success: true, plan: JSON.parse(clean) };
  } catch {
    return { success: false, message: 'Could not parse AI response' };
  }
};
