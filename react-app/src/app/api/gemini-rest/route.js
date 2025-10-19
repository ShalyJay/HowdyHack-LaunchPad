export async function POST(req) {
  try {
    const { prompt, fileData, skills, jobReqs } = await req.json();

    console.log("=== API ROUTE CALLED ===");
    console.log("jobReqs:", jobReqs);
    console.log("skills:", skills);
    console.log("========================");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Handle job requirements (URLs or text)
    let jobRequirements = "";
    if (jobReqs && jobReqs.trim()) {
      // Check if it's a URL
      if (jobReqs.trim().startsWith('http')) {
        try {
          console.log("=== SCRAPING URL WITH JINA AI ===");
          console.log("Original URL:", jobReqs.trim());

          // Use Jina AI Reader to scrape the webpage (handles JavaScript)
          const jinaUrl = `https://r.jina.ai/${jobReqs.trim()}`;
          const jinaResponse = await fetch(jinaUrl, {
            headers: {
              'Accept': 'text/plain',
            }
          });

          if (!jinaResponse.ok) {
            const statusCode = jinaResponse.status;
            if (statusCode === 524) {
              throw new Error('URL took too long to load (timeout) - please copy/paste the requirements text instead');
            } else if (statusCode === 403 || statusCode === 401) {
              throw new Error('URL is protected and cannot be scraped - please copy/paste the requirements text instead');
            } else {
              throw new Error(`Could not scrape URL (status ${statusCode}) - please copy/paste the requirements text instead`);
            }
          }

          const scrapedContent = await jinaResponse.text();

          console.log("=== SCRAPED CONTENT (first 1000 chars) ===");
          console.log(scrapedContent.substring(0, 1000));
          console.log("==========================================");

          // Check if we hit a bot protection page (Cloudflare, etc.)
          if (scrapedContent.includes('Cloudflare') ||
              scrapedContent.includes('Additional Verification Required') ||
              scrapedContent.includes('Ray ID') ||
              scrapedContent.includes('Waiting for') ||
              scrapedContent.length < 500) {
            console.log("⚠️  BOT PROTECTION DETECTED - Content not accessible");
            throw new Error('Website has bot protection - please copy/paste the job requirements text instead');
          }

          console.log("✅ Successfully scraped content from URL");
          jobRequirements = `\n\nJOB POSTING CONTENT (scraped from ${jobReqs.trim()}):\n${scrapedContent}`;
        } catch (err) {
          console.error("Error scraping URL with Jina:", err);

          // Return a clear error message to the user instead of falling back to Gemini
          // (because Gemini will just hallucinate if it can't actually read the URL)
          return new Response(
            JSON.stringify({
              error: `❌ URL Scraping Failed: ${err.message}\n\nPlease copy and paste the job requirements text directly into the form instead.`
            }),
            { status: 400 }
          );
        }
      } else {
        // User pasted text directly
        jobRequirements = `\n\nJOB REQUIREMENTS (provided by user):\n${jobReqs}`;
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

    // Add extracted job requirements if we fetched any
    if (jobRequirements) {
      fullPrompt += jobRequirements;
    }

    console.log("=== EXTRACTED JOB REQUIREMENTS ===");
    console.log(jobRequirements);
    console.log("=================================");

    console.log("=== FULL PROMPT SENT TO GEMINI ===");
    console.log(fullPrompt);
    console.log("==================================");

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
