// File: netlify/functions/gptJoke.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "dad";

  let prompt = "";

  if (type === "alle") {
    prompt = `Generate an original Norwegian "Alle barna" joke. that abides by the cultural Alle Barna joke structure of a "crazy"/unexpected, but RELEVANT/connected twist at the end.

Instructions:

- The joke must be two lines in Norwegian, followed by a two-line English translation.
- The last Norwegian line must rhyme (rhyme with the child's name).
- The English lines do not need to rhyme — just translate faithfully.
- Keep the humor dark but culturally appropriate, never cruel or graphic. 
- Do not repeat the same name in multiple jokes.
- Do not repeat the same name more than once per joke.
- Avoid generic names like “Lars” unless necessary.

Use this exact format with one blank line between:

Alle barna ...
... bortsett fra [Name], [rhyme]

All the children ...
... except [Name], [English punchline]`;
  } else {
    prompt = `Give a short, freshly created, kid-friendly English dad joke. Keep it under 15 words.
    Return only the joke, no commentary. Confirm the punchline makes sense and is complete,
    and that it does not contain a synonym to a correct punchline that then makes it incorrect.
    IMPORTANT: The jokes cannot repeat.`;
  }

  try {
    const out = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const joke = out.choices[0].message.content.trim();

    return new Response(joke, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    return new Response("Function error: " + err.message, {
      status: 500,
    });
  }
}
