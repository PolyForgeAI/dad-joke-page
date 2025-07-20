import OpenAI from "openai";

export default async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).send("OPENAI_API_KEY is missing from env vars.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const out = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Return a short, kid-friendly dad joke (10 words or fewer).",
      },
    ],
  });

  res.status(200).send(out.choices[0].message.content.trim());
};
