// Vercel Serverless Function — generowanie tytułów i opisów przez Groq API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, titleParam, descParam, colorParam, dimParam } = req.body || {};
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Brak klucza GROQ_API_KEY po stronie serwera.' });
  }

  let systemMessage = '';
  let userMessage = '';

  if (mode === 'title') {
    systemMessage = 'Jesteś wybitnym asystentem SEO. Wygeneruj NAJLEPSZY MOŻLIWY, mocny tytuł aukcji internetowej (idealna długość 60-70 znaków, max 75). Zwróć TYLKO czysty tekst tytułu. CAŁKOWITY ZAKAZ używania cudzysłowów ("), emoji, oraz surowych formatów typu "040*060cm".';
    userMessage = `Zoptymalizuj tytuł.\nOryginalna nazwa: ${titleParam || 'Brak'}\nKolor: ${colorParam || 'Brak'}\nWymiary: ${dimParam || 'Brak'}`;
  } else {
    systemMessage = 'Jesteś Copywriterem e-commerce. Przekształć stary, suchy opis w wciągający, angażujący tekst sprzedażowy językiem korzyści. Zwróć TYLKO czysty tekst nowego opisu. CAŁKOWITY ZAKAZ: emoji, cudzysłowów, wstępów. WAŻNE: W opisie MUSISZ użyć konkretnych wymiarów produktu, które podam (np. 40 x 60 cm), nigdy nie używaj symboli "X x Y".';
    userMessage = `Popraw opis dla produktu "${titleParam || 'Brak'}".\nWymiary do użycia: ${dimParam || 'Brak'}\nKolor: ${colorParam || 'Brak'}\nObecny opis: ${descParam || 'Brak'}`;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: String(systemMessage) },
          { role: 'user', content: String(userMessage) }
        ],
        temperature: 0.6,
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const result = data.choices[0].message.content.trim();
      res.status(200).json({ result });
    } else {
      const groqErrorMsg = data.error?.message || 'Błąd odpowiedzi z modelu Groq.';
      res.status(500).json({ error: `Odmowa Groq API: ${groqErrorMsg}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
