export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const groqMessages = messages.map(m => {
      if (m.hasImage) {
        return {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${m.imageType};base64,${m.imageBase64}`
              }
            },
            {
              type: 'text',
              text: m.content || 'Analyse cette image'
            }
          ]
        };
      }
      return { role: m.role, content: m.content };
    });

    const hasImageInMessages = messages.some(m => m.hasImage);
    const model = hasImageInMessages ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.1-8b-instant';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Tu es Kangourou, une IA surf-vibes. Tu reponds en français avec energie et bonne humeur.
Quand l'utilisateur demande de generer/creer/dessiner une image, reponds UNIQUEMENT avec ce JSON (rien d'autre) :
{"action":"generate_image","prompt":"<prompt en anglais tres detaille>","message":"<commentaire sympa en français>"}
Sinon reponds normalement en texte. Si on t'envoie une image, analyse-la avec enthousiasme en mode surf !`
          },
          ...groqMessages
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data).slice(0, 300));

    const reply = data?.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu répondre !';
    res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: 'Erreur serveur : ' + e.message });
  }
}
