export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const system = `Tu es Kangourou, une IA surf-vibes. Tu reponds en français avec energie et bonne humeur.
Quand l'utilisateur demande de generer/creer/dessiner une image, reponds UNIQUEMENT avec ce JSON (rien d'autre) :
{"action":"generate_image","prompt":"<prompt en anglais tres detaille>","message":"<commentaire sympa en français>"}
Sinon reponds normalement en texte.`;

    const geminiMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: geminiMessages
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu répondre !';

    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: 'Erreur serveur : ' + e.message });
  }
}
