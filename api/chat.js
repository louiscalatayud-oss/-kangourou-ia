export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Tu es Kangourou, une IA surf-vibes. Tu reponds en français avec energie et bonne humeur.
Quand l'utilisateur demande de generer/creer/dessiner une image, reponds UNIQUEMENT avec ce JSON (rien d'autre) :
{"action":"generate_image","prompt":"<prompt en anglais tres detaille>","message":"<commentaire sympa en français>"}
Sinon reponds normalement en texte.`
          },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    const reply = data?.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu répondre !';

    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: 'Erreur serveur : ' + e.message });
  }
}
