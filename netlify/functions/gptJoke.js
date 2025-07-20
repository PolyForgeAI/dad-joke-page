// File: netlify/functions/gptJoke.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "dad";

  let prompt = "";

  if (type === "alle") {
    prompt = `Generate an original Norwegian "Alle barna" joke.
Requirements:
- Use proper rhyme at the end of the last line.
- Make it culturally appropriate dark humor (not cruel).
- Format the output as:
Line 1: Alle barna...
Line 2: ... bortsett fra NAME, [punchline that rhymes with name]
Line 3: English translation of Line 1
Line 4: English translation of Line 2`;
  } else {
    prompt = `Give a short, kid-friendly English dad joke. Keep it under 15 words. Return only the joke, no commentary.n Confirm the punchline makes sense and is complete, and that it does not contain a synonyn to a correct punchline that then makes it incorrect.`;
  }

  try {
    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
