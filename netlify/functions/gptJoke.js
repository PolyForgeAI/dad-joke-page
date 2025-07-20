/**
 * ============================================================================
 *  🔧  Netlify Function: gptJoke.js
 * ----------------------------------------------------------------------------
 *  ▸ Location   : GitHub / repo root / netlify / functions / gptJoke.js
 *      (Path matters—Netlify treats any file inside that folder as a function.)
 *
 *  ▸ Purpose    : Acts as a secure middle-tier so the browser never sees the
 *                 OpenAI API key. Generates a short kid-friendly dad joke
 *                 using GPT (model = gpt-4o-mini) and returns it as plain text.
 *
 *  ▸ Request    : HTTP GET  → /.netlify/functions/gptJoke
 *  ▸ Response   : 200 OK    → "Why did the scarecrow win an award? ..."
 *
 *  ▸ Runtime    : Netlify automatically bundles the file with its own
 *                 serverless infrastructure (AWS-Lambda under the hood).
 *
 *  ▸ Environment:
 *       process.env.OPENAI_API_KEY  ←  Set via Netlify Dashboard ▸ Site ▸
 *                                      Environment variables.
 *       No other dependencies; Netlify uses esbuild to bundle the OpenAI
 *       package automatically.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
   STEP 1: Import the OpenAI SDK
   ---------------------------------------------------------------------------
   It’s an ESM-first library. Netlify’s build system recognizes top-level
   `import` statements in .js files and bundles them; no manual npm install
   in production is needed as long as the library is in package.json OR
   imported directly (Netlify auto-installs peer dependencies).
--------------------------------------------------------------------------- */
import OpenAI from "openai";

/* ---------------------------------------------------------------------------
   STEP 2: The default export **is** the serverless handler function.
   Signatures vary by framework, but for Netlify we export an async function
   that receives (req, res).  We can also use named exports, but default
   is simplest.
--------------------------------------------------------------------------- */
export default async (req, res) => {
  /* -------------------------------------------------------------------------
     SAFETY CHECK: Ensure the API key exists—
     If you typo the key name in Netlify’s env-var screen, we bail early.
  ------------------------------------------------------------------------- */
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(500)
      .send(
        "Server mis-config: OPENAI_API_KEY is missing. " +
        "Add it in Netlify ▸ Site settings ▸ Environment variables."
      );
  }

  /* -------------------------------------------------------------------------
     STEP 3: Instantiate the OpenAI client with the secret key.
     ⚠️  SECURITY NOTE: The key lives ONLY on the server; never send it to
        the client or put it in GitHub.
  ------------------------------------------------------------------------- */
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  /* -------------------------------------------------------------------------
     STEP 4: Craft the chat-completion request
     - model: `gpt-4o-mini` → inexpensive + low latency.
     - messages: We provide a **system** role with an *extremely narrow* task
       to avoid large outputs (jokes ≤ 10 words).
  ------------------------------------------------------------------------- */
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Return a short, kid-friendly dad joke in 10 words or fewer. " +
          "Do NOT add extra commentary—just the joke.",
      },
    ],
  });

  /* -------------------------------------------------------------------------
     STEP 5: Extract the generated joke string
     - GPT returns an object → choices[0] → message → content.
     - `.trim()` removes leading/trailing whitespace or newline.
  ------------------------------------------------------------------------- */
  const jokeText = completion.choices[0].message.content.trim();

  /* -------------------------------------------------------------------------
     STEP 6: Respond to the browser
     - Plain text (`text/plain`) so front-end can simply `.text()` it.
     - HTTP status
