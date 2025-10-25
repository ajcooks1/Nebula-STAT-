import OpenAI from "openai";
import Twilio from "twilio";

// OpenAI client
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Twilio client
export const twilioClient = new Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);


