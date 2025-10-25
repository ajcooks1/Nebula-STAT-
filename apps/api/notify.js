export async function notifyScheduled(payload) {
    if (!process.env.N8N_WEBHOOK_URL) return { skipped: true };
    const r = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: r.status };
  }
  