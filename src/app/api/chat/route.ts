import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OpenAI API key." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: "gpt-5-turbo",
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...body.messages,
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${content}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Failed to generate story scene", error);
    return NextResponse.json(
      { error: "Failed to generate story scene." },
      { status: 500 }
    );
  }
}
