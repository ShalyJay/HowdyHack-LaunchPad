import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { prompt, fileData } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let input = [prompt];

    if (fileData) {
      input.push({
        inlineData: {
          mimeType: "application/pdf",
          data: fileData,
        },
      });
    }

    const result = await model.generateContent(input);
    const text = result.response.text();

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
