import { NextResponse } from "next/server";
import OpenAI from "openai";
import newsData from "@/data/news.json";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const { question } = await req.json();

  const rawContext = JSON.stringify(newsData);

  const contextResponse = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
  You are a system that converts raw JSON news data into a clean structured news summary.

  Rules:
  - Extract the most important information.
  - Keep title, source, category, date and summary.
  - Remove unnecessary metadata.
  - Format in simple bullet points.
  - Separate each article clearly.
  `
      },
      {
        role: "user",
        content: `Convert this JSON news data into readable news context:\n\n${rawContext}`
      }
    ],
  });

  const refinedContext = contextResponse.choices[0].message.content;

  const response = await openai.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [
    {
      role: "system",
      content: `
You are a news assistant.

Answer ONLY from the provided news data.

Format the response in clean markdown.

Rules:
- No tables
- No pipe characters
- Use bullet points
- Separate news clearly
`
    },
    {
      role: "user",
      content: `News Data:\n${refinedContext}\n\nQuestion: ${question}`
    }
  ],
});

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}