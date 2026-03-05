import { NextResponse } from "next/server";
import OpenAI from "openai";
import newsData from "@/data/news.json";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  const { question } = await req.json();

  // Convert JSON into readable context
  const context = newsData
    .map(
      (item) =>
      `Source Id: ${item.source.id}\nSource Name: ${item.source.name}
      \nTitle: ${item.title}
      \nAuthor: ${item.author}
      \nPublished At: ${item.publishedAt}
      \nCountry: ${item.country}\n
      \nCategory: ${item.category}\nContent: ${item.content}
      \nURL: ${item.url}\nDescription: ${item.description}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
  role: "system",
  content: `
You are a news assistant.

Answer ONLY from the provided news data.

Format the response in clean, readable markdown.

Rules:
- Do NOT use markdown tables.
- Do NOT use pipe (|) characters.
- Use bullet points instead.
- Separate each news item clearly.
- Keep formatting simple and readable.
`
},
      {
        role: "user",
        content: `News Data:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return NextResponse.json({
    result: response.choices[0].message.content,
  });
}