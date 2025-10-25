import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function triageTicket(text) {
  const system = `You are a property maintenance triage agent.
Return compact JSON:
- category: one of HVAC, plumbing, electrical, other
- severity: one of low, medium, high
- suggestion: <= 120 chars, practical next step.`;
  const user = `Ticket: """${text}"""`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(resp.choices[0].message.content);
}

