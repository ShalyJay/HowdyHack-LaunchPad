export async function POST(req) {
  try {
    const { prompt, fileData, skills, jobReqs } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Fetch and extract technical requirements from job URLs
    let jobRequirements = "";
    if (jobReqs && jobReqs.trim()) {
      const urls = jobReqs.split('\n').filter(line =>
    line.trim().startsWith('http'));

      if (urls.length > 0) {
        try{
          //fetch content from URLs
          const fetchPromises = urls.map(async (url) =>{
            const response = await fetch(url.trim());
            const html = await response.text();

            // add gemini extraction call
            const extractionPrompt = `Extract ONLY the technical skills, 
            qualifications, and requirements from this job posting. 

            Focus on:
            - Minimum qualifications (technical skills required)
            - Preferred qualifications (nice to have)
            - Programming languages
            - Frameworks/tools
            - Technical competencies

            Ignore: company description, benefits, culture, soft skills.

            Return as a concise bullet list.

            Job Posting HTML:
            ${html.substring(0, 10000)}`;

            const extractResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: extractionPrompt }] }]
                })
              }
            );

            const extractData = await extractResponse.json();
            const requirements =
            extractData.candidates?.[0]?.content?.parts?.[0]?.text || "Could not extract requirements";

            return `\n\nTechnical Requirements from ${url}:\n${requirements}`;

            // We'll parse the response next

          });
      } catch (err){
        console.error("Error fetching job URLS:", err);
        return `\n\nCould not fetch ${url}`;
      }
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
      //gemini-2.5-flash
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
