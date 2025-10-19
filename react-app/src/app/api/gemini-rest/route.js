export async function POST(req) {
  try {
    const { prompt, fileData, skills, jobUrls } = await req.json();

    console.log("=== API ROUTE CALLED ===");
    console.log("jobUrls:", jobUrls);
    console.log("skills:", skills);
    console.log("========================");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Helper function to scrape a single URL
    async function scrapeOneUrl(url, index) {
      try {
        console.log(`=== SCRAPING JOB ${index + 1} ===`);
        console.log("URL:", url);

        const jinaUrl = `https://r.jina.ai/${url}`;
        const jinaResponse = await fetch(jinaUrl, {
          headers: { 'Accept': 'text/plain' }
        });

        if (!jinaResponse.ok) {
          throw new Error(`HTTP ${jinaResponse.status}`);
        }

        const content = await jinaResponse.text();

        // Check for bot protection
        if (content.includes('Cloudflare') ||
            content.includes('Additional Verification Required') ||
            content.includes('Ray ID') ||
            content.includes('Waiting for') ||
            content.length < 500) {
          throw new Error('Bot protection detected');
        }

        console.log(`✅ Job ${index + 1} scraped successfully`);
        return { success: true, url, content, jobNumber: index + 1 };
      } catch (err) {
        console.error(`❌ Job ${index + 1} failed:`, err.message);
        return { success: false, url, error: err.message, jobNumber: index + 1 };
      }
    }

    // Scrape all URLs in parallel
    let jobRequirements = "";
    if (jobUrls && jobUrls.length > 0) {
      console.log(`=== SCRAPING ${jobUrls.length} JOB URLS ===`);

      // Scrape all URLs at once
      const results = await Promise.all(
        jobUrls.map((url, index) => scrapeOneUrl(url, index))
      );

      // Separate successful vs failed scrapes
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      // If ALL failed, return error
      if (successful.length === 0) {
        return new Response(
          JSON.stringify({
            error: `❌ All job URLs failed to scrape:\n${failed.map(f => `Job ${f.jobNumber}: ${f.error}`).join('\n')}`
          }),
          { status: 400 }
        );
      }

      // Build the combined job postings content
      jobRequirements = `\n\n=== ${successful.length} JOB POSTING(S) ===\n\n`;
      successful.forEach(result => {
        jobRequirements += `--- JOB ${result.jobNumber}: ${result.url} ---\n${result.content}\n\n`;
      });

      if (failed.length > 0) {
        console.log(`⚠️  ${failed.length} job(s) failed, but continuing with ${successful.length} successful scrape(s)`);
      }

      // Log what Gemini will see (for debugging)
      console.log("\n=== WHAT GEMINI WILL SEE ===");
      successful.forEach(result => {
        console.log(`\n--- JOB ${result.jobNumber}: ${result.url} ---`);
        console.log(result.content.substring(0, 500) + "...\n");
      });
      console.log("===========================\n");

      // Store for sending back to frontend
      var scrapedJobsData = successful.map(r => ({
        jobNumber: r.jobNumber,
        url: r.url,
        content: r.content
      }));
    } else {
      // No URLs provided (shouldn't happen based on frontend validation)
      jobRequirements = "";
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

    return new Response(
      JSON.stringify({
        text,
        scrapedJobs: scrapedJobsData || []
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
