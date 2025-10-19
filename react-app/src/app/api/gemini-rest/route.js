export async function POST(req) {
  try {
    const { prompt, fileData, skills } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Build the parts array dynamically based on what's provided
    const parts = [];

    // Add the main prompt
    let fullPrompt = prompt;

    // If skills are provided, add them to the prompt
    if (skills && skills.trim()) {
      fullPrompt += `\n\nAdditional Skills: ${skills}`;
    }

    parts.push({ text: fullPrompt });

    // Add PDF if provided
    if (fileData) {
      parts.push({
        inline_data: {
          mime_type: "application/pdf",
          data: fileData,
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate content");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text content in response");
    }

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
