export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: `Tu es Kangourou, une IA surf-vibes. Tu reponds en français avec energie et bonne humeur.
Quand l'utilisateur demande de generer/creer/dessiner une image, reponds UNIQUEMENT avec ce JSON (rien d'autre) :
{"action":"generate_image","prompt":"<prompt en anglais tres detaille>","message":"<commentaire sympa en français>"}
Sinon reponds normalement en texte.`,
      messages
    })
  });

  const data = await response.json();
  const reply = data.content?.find(b => b.type === 'text')?.text || '...';

  res.status(200).json({ reply });
}
