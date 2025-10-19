'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import RoadmapTimeline from '../components/RoadmapTimeline';

export default function Form() {
    // form input states
    const [resume, setResume] = useState<File | null>(null);        //resume input
    const [fileData, setFileData] = useState<string | null>(null);  //base64 resume data for API
    const [skills, setSkills] = useState("");                       //skills text input
    const [jobUrls, setJobUrls] = useState<string[]>(["", "", "", "", ""]); //up to 5 job URLs
    const [visibleUrlInputs, setVisibleUrlInputs] = useState<number>(1); // Track how many URL inputs to show
    const [timeFrame, setTimeFrame] = useState<string>("3 months"); //time frame for roadmap
    const [response, setResponse] = useState("");                   //Gemini API response
    const [modules, setModules] = useState<any[]>([]);              //Parsed roadmap
    const [loading, setLoading] = useState(false);                  //loading state while API
    const [loadingProgress, setLoadingProgress] = useState(0);      //progress percentage (0-100)

    // CLARIFICATION FEATURE - Currently disabled
    // Uncomment these states if you want to re-enable the clarification feature
    // const [clarificationNeeded, setClarificationNeeded] = useState(false);
    // const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
    // const [userAnswers, setUserAnswers] = useState<{[key: string]: boolean}>({});
    // const [highPriority, setHighPriority] = useState<string[]>([]);
    // const [lowPriority, setLowPriority] = useState<string[]>([]);
    // const [useClarifications, setUseClarifications] = useState(true);

    // resume upload
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;


        //check if resume file is pdf
        if (file.type !== "application/pdf") {
            alert("Please upload a PDF file.");
            return;
        }

        setResume(file);

        // Convert to base64 for API
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result?.toString().split(",")[1];
            setFileData(base64String || null);
        };
        reader.readAsDataURL(file);
    };

    // entire form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log({resume, skills, jobUrls});

        // require resume/skills AND at least one job URL
        if (!fileData && !skills.trim()) {
            alert("Please upload a resume or enter skills (or both)!");
            return;
        }

        const filledUrls = jobUrls.filter(url => url.trim() !== "");
        if (filledUrls.length === 0) {
            alert("Please enter at least one job posting URL!");
            return;
        }

        setLoading(true);
        setLoadingProgress(10); // Start progress
        setResponse("");

        // Simulate gradual progress during the long API call
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev < 98) {
                    // Add random increment that gets smaller as we approach 98%
                    const randomFactor = 0.5 + Math.random() * 0.5; // Random between 0.5 and 1.0

                    // Different speeds for different phases
                    // 0-10: fast, 10-70: very slow (60% of time), 70-90: medium, 90-100: slow
                    let slowdownFactor;
                    if (prev < 10) {
                        // Starting phase: fast
                        slowdownFactor = 0.30;
                    } else if (prev < 70) {
                        // Scraping phase: VERY SLOW (60% of time)
                        slowdownFactor = 0.02;
                    } else if (prev < 90) {
                        // Analyzing phase: medium
                        slowdownFactor = 0.12;
                    } else {
                        // Final phase: slow
                        slowdownFactor = 0.05;
                    }

                    const increment = (98 - prev) * slowdownFactor * randomFactor;
                    return Math.min(prev + increment, 98);
                }
                return prev;
            });
        }, 600); // Update every 600ms for smoother feel

        try {
            // Base prompt for Gemini - MULTI-JOB AGGREGATION approach
            let prompt = `You are a career advisor analyzing MULTIPLE job postings to create a PERSONALIZED learning roadmap.

            CRITICAL RULES:
            1. IGNORE ALL SOFT SKILLS (communication, teamwork, problem-solving, leadership, troubleshooting, debugging)
            2. ONLY extract TECHNICAL skills and technologies
            3. ONLY extract specific, named technologies (Python, Java, React, AWS, Docker, Kubernetes, etc.)
            4. IGNORE vague terms like "web development", "distributed systems", "machine learning" unless they name specific tools

            YOU WILL RECEIVE ${filledUrls.length} JOB POSTING(S). Your task:

            STEP 0: ANALYZE JOB SIMILARITY
            - Compare the job postings to see if they are similar career paths
            - If jobs are VERY DIFFERENT (e.g., Frontend Developer vs Data Scientist), set "similarJobs": false
            - If jobs are SIMILAR or OVERLAPPING (e.g., multiple Backend roles, or Full Stack roles), set "similarJobs": true

            STEP 1: EXTRACT TECHNOLOGIES FROM EACH JOB
            For each job posting, extract ALL specific technologies mentioned (programming languages, frameworks, databases, cloud platforms, tools, etc.)

            STEP 2: AGGREGATE AND PRIORITIZE BY FREQUENCY
            Count how many jobs mention each technology:
            - Technologies appearing in ALL ${filledUrls.length} jobs = CRITICAL (🔥)
            - Technologies appearing in 50%+ of jobs = HIGH PRIORITY (⭐)
            - Technologies appearing in 2+ jobs = MEDIUM PRIORITY (📌)
            - Technologies appearing in 1 job = LOW PRIORITY (💡)

            STEP 3: IDENTIFY USER'S CURRENT SKILLS
            USER'S CURRENT SKILLS/EXPERIENCE:
            ${skills ? `Skills: ${skills}` : 'No skills provided'}
            ${fileData ? 'Resume: (PDF provided with work history)' : 'No resume provided'}

            STEP 4: FIND THE GAPS
            Compare aggregated job requirements to user skills. What specific technologies does the user NOT have?

            STEP 5: CREATE PRIORITIZED ROADMAP (MAX 7 TECHNOLOGIES)
            CRITICAL RULE: Include a MAXIMUM of 7 technologies in the roadmap.
            TIME CONSTRAINT: The user wants to complete this roadmap in ${timeFrame}. Structure the learning plan to be achievable within this timeframe.

            Priority order:
            1. Include ALL CRITICAL technologies (appearing in all jobs) - these are non-negotiable
            2. Include HIGH PRIORITY technologies (50%+ jobs) - focus on most industry-relevant
            3. If still under 7, add MEDIUM PRIORITY - choose the most widely-used/industry-standard ones
            4. SKIP LOW PRIORITY unless there's room and they're highly relevant

            If you have more than 7 technologies:
            - Keep all CRITICAL
            - Prioritize by industry relevance and market demand
            - Choose technologies that are:
              * Most commonly used in the industry
              * Have strong job market demand
              * Are foundational/transferable skills

            Create modules starting with CRITICAL, then HIGH, then MEDIUM.

            Return your response as valid JSON in this exact format:
            {
            "similarJobs": true,
            "totalJobsAnalyzed": ${filledUrls.length},
            "jobSummary": "Brief description of the ${filledUrls.length} jobs (e.g., '3 Backend Engineering roles focusing on distributed systems')",
            "technologyFrequency": {
                "critical": ["Python", "Docker"],
                "high": ["Kubernetes", "PostgreSQL"],
                "medium": ["Redis"],
                "low": ["GraphQL"]
            },
            "currentSkills": ["Python", "React"],
            "missingSkills": {
                "critical": ["Docker"],
                "high": ["Kubernetes", "PostgreSQL"],
                "medium": ["Redis"],
                "low": ["GraphQL"]
            },
            "modules": [
                {
                "title": "Learn Docker Fundamentals",
                "priority": "critical",
                "duration": "3 weeks",
                "skills": ["Docker"],
                "description": "Essential for all 3 jobs - containerization is a must-have",
                "weeklyBreakdown": [
                    {
                    "week": 1,
                    "topics": ["Docker basics & installation", "Containers vs VMs", "Basic Docker commands"],
                    "goals": "Understand containerization and run your first container",
                    "estimatedHours": "8-10 hours"
                    },
                    {
                    "week": 2,
                    "topics": ["Dockerfile creation", "Building custom images", "Docker networking"],
                    "goals": "Build and manage your own Docker images",
                    "estimatedHours": "8-10 hours"
                    },
                    {
                    "week": 3,
                    "topics": ["Docker Compose", "Multi-container apps", "Practice project"],
                    "goals": "Deploy a full-stack application with Docker Compose",
                    "estimatedHours": "10-12 hours"
                    }
                ],
                "resources": ["Docker Official Tutorial", "FreeCodeCamp Docker Course", "Docker Practice Labs"]
                }
            ]
            }

            CRITICAL REQUIREMENTS:
            - MAXIMUM 7 MODULES (technologies) - Be selective! Choose the most industry-relevant technologies
            - TIME FRAME: ${timeFrame} - Ensure the total learning plan is achievable in this time
            - Each module = ONE technology, but include a "weeklyBreakdown" array with week-by-week topics (Coursera-style)
            - Each week in the breakdown should have:
              * "week": number (1, 2, 3, etc. within that module)
              * "topics": array of 3-5 specific topics for that week
              * "goals": what the learner should achieve by end of week
              * "estimatedHours": realistic time commitment (5-15 hours/week)
            - If jobs are TOO DIFFERENT (unrelated career paths), set "similarJobs": false and mention this in jobSummary
            - ONLY create modules for technologies in "missingSkills"
            - Include "priority" field in each module (critical/high/medium/low)
            - Start with CRITICAL priority modules first, then HIGH, then MEDIUM
            - Provide 3+ FREE resources per module (not per week)
            - Set realistic "duration" (in weeks) based on the ${timeFrame} constraint`;

            // Job URLs will be handled by the API - just mention them in the prompt
            prompt += `\n\nYou will receive scraped content from ${filledUrls.length} job posting(s). Analyze ALL of them to find common patterns and important technologies.`;

            // CLARIFICATION FEATURE - Commented out
            // Uncomment this section if you re-enable clarifications
            /*
            if (Object.keys(userAnswers).length > 0) {
                const hasExperience = Object.entries(userAnswers)
                    .filter(([_, hasExp]) => hasExp)
                    .map(([tech]) => tech);
                const noExperience = Object.entries(userAnswers)
                    .filter(([_, hasExp]) => !hasExp)
                    .map(([tech]) => tech);

                prompt += `\n\nUSER CLARIFICATION (this is a SECOND submission after user answered clarifying questions):`;
                if (hasExperience.length > 0) {
                    prompt += `\nUser HAS experience with: ${hasExperience.join(', ')}`;
                }
                if (noExperience.length > 0) {
                    prompt += `\nUser DOES NOT have experience with: ${noExperience.join(', ')}`;
                }
                prompt += `\n\nIMPORTANT: DO NOT ask for clarification again. Create the final roadmap now.`;
                prompt += `\nCreate a roadmap that includes ONLY the technologies the user does NOT have experience with.`;
            }
            */

            const res = await fetch("/api/gemini-rest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    fileData: fileData,
                    skills: skills,
                    jobUrls: filledUrls  // Send array of URLs instead of single jobReqs
                }),
            });

            const data = await res.json();

            clearInterval(progressInterval); // Stop the interval
            setLoadingProgress(99); // Almost done

            // Log scraped content to browser console for debugging
            if (data.scrapedJobs && data.scrapedJobs.length > 0) {
                console.log("\n🔍 === WHAT GEMINI SAW FROM URLS ===");
                data.scrapedJobs.forEach((job: any) => {
                    console.log(`\n--- JOB ${job.jobNumber}: ${job.url} ---`);
                    console.log(job.content.substring(0, 1000));
                    console.log("...\n");
                });
                console.log("=====================================\n");
            }

            if (data.error) {
                setResponse(data.error);
                setModules([]);
            } else if (data.text) {
            // Try to parse JSON from Gemini's response
                try {
                    // Sometimes Gemini wraps JSON in markdown code blocks, so we need to extract it
                    let jsonText = data.text;

                    // Remove markdown code blocks if present
                    if (jsonText.includes('```json')) {
                        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
                    } else if (jsonText.includes('```')) {
                        jsonText = jsonText.split('```')[1].split('```')[0].trim();
                    }

                    // TEST: throw new Error("Testing fallback"); // Force fallback works:)
                    const parsed = JSON.parse(jsonText);

                    console.log("=== PARSED RESPONSE ===");
                    console.log("Full parsed:", parsed);
                    console.log("=====================");

                    // CLARIFICATION FEATURE - Commented out
                    // Uncomment this block if you re-enable clarifications
                    /*
                    if (parsed.needsClarification && parsed.questions && useClarifications) {
                        setClarificationNeeded(true);
                        setClarificationQuestions(parsed.questions);
                        setHighPriority(parsed.highPriority || []);
                        setLowPriority(parsed.lowPriority || []);
                        setUserAnswers({});
                        setModules([]);
                        setResponse("");
                    } else {
                    */

                    // Normal roadmap response
                    console.log("jobPostingPreview:", parsed.jobPostingPreview);
                    console.log("jobRequirements:", parsed.jobRequirements);

                    // Set the entire parsed object (includes jobPostingPreview, jobRequirements, etc.)
                    setModules(parsed);
                    setResponse(""); // Clear text response since we have modules

                    // } // End of clarification block
                } catch (parseError) {
                    // If JSON parsing fails, show as text
                    console.error("Failed to parse JSON:", parseError);
                    setResponse(data.text);
                    setModules([]);
                }
            } else {
                setResponse("No response");
                setModules([]);
            }

            setLoadingProgress(100); // Complete

            } catch(error){
                console.error(error);
                setResponse("Error connecting to Gemini API.");
                clearInterval(progressInterval); // Stop the interval on error
                setLoadingProgress(0); // Reset on error
            }

        setLoading(false);

        // Reset progress after a short delay
        setTimeout(() => setLoadingProgress(0), 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">

                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-8">
                    Generate Roadmap
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2">
                            Upload Resume
                        </label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="cursor-pointer">
                            {resume ? (
                            <div>
                                <p className="text-lg text-green-600">✓ {resume.name}</p>
                                <p className="text-sm mt-2 text-gray-500">click to change</p>
                            </div>
                            ) : (
                            <div>
                                <p className="text-lg">📄 Click to upload PDF</p>
                                <p className="text-sm mt-2 text-gray-500">or drag and drop</p>
                            </div>
                            )}
                        </label>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">Your Skills</label>
                        <textarea
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., JavaScript, React, Python..."
                            className="w-full p-3 border rounded h-20"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Time Frame</label>
                        <select
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value)}
                            className="w-full p-3 border rounded"
                        >
                            <option value="1 month">1 month</option>
                            <option value="2 months">2 months</option>
                            <option value="3 months">3 months</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                            <option value="2 years">2 years</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">
                            Job Posting URLs (1-5 jobs)
                            {jobUrls.filter(url => url.trim() !== "").length > 0 && (
                                <span className="ml-2 text-sm text-gray-500">
                                    ({jobUrls.filter(url => url.trim() !== "").length}/5 added)
                                </span>
                            )}
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                            Enter job URLs you're interested in. We'll analyze them and create a roadmap with the most important skills.
                            <br />
                            <span className="text-xs text-gray-500">
                                ⚠️ Note: Some sites (Indeed, LinkedIn) have bot protection and may not work.
                            </span>
                        </p>
                        <div className="space-y-3">
                            {jobUrls.map((url, index) => {
                                // Only show this input if it's within the visible count
                                if (index >= visibleUrlInputs) return null;

                                return (
                                    <div
                                        key={index}
                                        className={index > 0 ? "animate-fadeIn" : ""}
                                    >
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(e) => {
                                                const newUrls = [...jobUrls];
                                                newUrls[index] = e.target.value;
                                                setJobUrls(newUrls);

                                                // Auto-hide subsequent empty inputs when user clears a field
                                                if (e.target.value.trim() === "" && index < visibleUrlInputs - 1) {
                                                    // If this input is now empty and there are inputs after it, hide them
                                                    setVisibleUrlInputs(index + 1);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                // When user presses Enter, show the next input (if not at max)
                                                if (e.key === 'Enter' && visibleUrlInputs < 5 && jobUrls[index].trim() !== "") {
                                                    e.preventDefault(); // Prevent form submission
                                                    setVisibleUrlInputs(visibleUrlInputs + 1);
                                                }
                                            }}
                                            placeholder={`Job ${index + 1} URL ${index === 0 ? '(required)' : '(optional)'}`}
                                            className="w-full p-3 border rounded"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CLARIFICATION FEATURE - Commented out */}
                    {/* To re-enable:
                        1. Uncomment the state variables at the top of the file
                        2. Uncomment the clarification logic in handleSubmit
                        3. Uncomment this UI section
                        4. Import ClarificationBox component: import ClarificationBox from '../components/ClarificationBox';
                    */}
                    {/*
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Clarify vague requirements</span>
                        <button
                            type="button"
                            onClick={() => setUseClarifications(!useClarifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                useClarifications ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    useClarifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    {clarificationNeeded && clarificationQuestions.length > 0 && (
                        <ClarificationBox
                            highPriority={highPriority}
                            lowPriority={lowPriority}
                            questions={clarificationQuestions}
                            userAnswers={userAnswers}
                            onAnswerChange={setUserAnswers}
                        />
                    )}
                    */}

                    <div className="flex items-center justify-center gap-4">
                        <Link href="/">
                            <button type="button" className="p-3 text-2xl hover:opacity-70">
                                ←
                            </button>
                        </Link>
                            <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-white/20 text-white rounded-full
                                hover:bg-white/40 hover:scale-110 transition-all backdrop-blur-sm border
                                border-white/30 cursor-pointer
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                {loading ? "Generating..." : "Generate Roadmap"}
                            </button>
                    </div>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="mt-6">
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${loadingProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-center text-sm text-gray-300 mt-2">
                                {loadingProgress < 10 && "Starting analysis..."}
                                {loadingProgress >= 10 && loadingProgress < 70 && "Scraping job postings..."}
                                {loadingProgress >= 70 && loadingProgress < 90 && "Analyzing requirements..."}
                                {loadingProgress >= 90 && loadingProgress < 100 && "Creating your roadmap..."}
                                {loadingProgress === 100 && "Complete!"}
                            </p>
                        </div>
                    )}
                </form>
                
                {/* Response Timeline */}
                <RoadmapTimeline modules={modules} />

                {/* fallback: show text response if json parsing failed */}
                {response && (
                    <div className="mt-8 p-4 border rounded">
                        <h2 className="text-xl font-bold mb-4">Your Learning
                            Roadmap:
                        </h2>
                        <div className="whitespace-pre-wrap">
                            {response}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}