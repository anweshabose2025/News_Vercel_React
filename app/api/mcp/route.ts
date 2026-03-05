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
        `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\nPublished At: ${item.publishedAt}
      \nURL To Image: ${item.urlToImage}\nURL: ${item.url}\nDescription: ${item.description}\nAuthor: ${item.author}
      \nCountry: ${item.country}\nSource Id: ${item.source.id}\nSource Name: ${item.source.name}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content:
          "Answer ONLY from the provided news data. If not found, say 'Not found in news data.' Format the answer in clean human-readable markdown.",
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