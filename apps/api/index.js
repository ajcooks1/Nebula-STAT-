import express from "express";
import cors from "cors";
import "dotenv/config.js";
import { z } from "zod";
import { supa } from "./supabase.js";
import { triageTicket } from "./triage.js";
import { notifyScheduled } from "./notify.js";

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// list requests (frontend calls this as /tickets)
app.get("/tickets", async (_req, res) => {
  const { data, error } = await supa
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ tickets: data });
});

// ingest: AI triage + insert into requests
app.post("/tickets/ingest", async (req, res) => {
  try {
    const schema = z.object({
      text: z.string().min(5),
      photoUrl: z.string().url().nullable().optional(),
      tenantId: z.string().uuid().nullable().optional(),
      propertyId: z.string().uuid().nullable().optional(),
    });
    const { text, photoUrl = null, tenantId = null, propertyId = null } =
      schema.parse(req.body);

    let triage;
    try {
      triage = await triageTicket(text);
    } catch {
      triage = {
        category: "other",
        severity: "medium",
        suggestion: "We received your request and will review shortly.",
      };
    }

    const { data, error } = await supa
      .from("requests")
      .insert({
        description: text,
        status: "Triaged",
        category: triage.category,
        photo_url: photoUrl,
        tenant_id: tenantId,
        property_id: propertyId,
      })
      .select()
      .single();
    if (error) throw error;

    res.json({ request: data, ai: triage });
  } catch (e) {
    res.status(400).json({ error: e.message ?? "bad request" });
  }
});

// (optional) technicians list if you created that table
app.get("/technicians", async (_req, res) => {
  const { data, error } = await supa.from("technicians").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ technicians: data });
});

// assign + notify via n8n
app.post("/tickets/:id/assign", async (req, res) => {
  try {
    const id = req.params.id;
    const schema = z.object({
      technicianId: z.string().uuid(),
      scheduledAt: z.string(), // ISO
    });
    const { technicianId, scheduledAt } = schema.parse(req.body);

    const { data: updated, error } = await supa
      .from("requests")
      .update({
        technician_id: technicianId,
        scheduled_at: scheduledAt,
        status: "Scheduled",
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    await notifyScheduled({
      ticketId: id,
      summary: `${updated.category ?? "Issue"} scheduled`,
      scheduledAt,
    });

    res.json({ ticket: updated });
  } catch (e) {
    res.status(400).json({ error: e.message ?? "bad request" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on :${port}`));
