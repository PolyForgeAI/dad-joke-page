import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(request) {
  try {
    const out = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Return a short, kid-friendly dad joke in 10 words or fewer.",
        },
      ],
    });

    const joke = out.choices[0].message.content.trim();

    return new Response(joke, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    return new Response("OpenAI function error: " + err.message, {
      status: 500,
    });
  }
}
