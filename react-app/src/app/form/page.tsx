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
    const [response, setResponse] = useState("");                   //Gemini API response
    const [modules, setModules] = useState<any[]>([]);              //Parsed roadmap
    const [loading, setLoading] = useState(false);                  //loading state while API

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
        setResponse("");

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

            STEP 5: CREATE PRIORITIZED ROADMAP
            Create modules for missing skills, starting with CRITICAL technologies first, then HIGH PRIORITY, then MEDIUM.

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
                "duration": "2-3 weeks",
                "skills": ["Docker"],
                "description": "Essential for all 3 jobs - containerization is a must-have",
                "resources": ["Docker Official Tutorial", "Docker Course on Udemy", "Docker Practice Labs"]
                }
            ]
            }

            CRITICAL REQUIREMENTS:
            - If jobs are TOO DIFFERENT (unrelated career paths), set "similarJobs": false and mention this in jobSummary
            - ONLY create modules for technologies in "missingSkills"
            - Each module focuses on ONE specific technology
            - Include "priority" field in each module (critical/high/medium/low)
            - Start with CRITICAL priority modules first
            - Provide 3+ FREE resources per module`;

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
            } catch(error){
                console.error(error);
                setResponse("Error connecting to Gemini API.");
            }

        setLoading(false);
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
                            className="w-full p-3 border rounded h-32"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Job Posting URLs (1-5 jobs)</label>
                        <p className="text-sm text-gray-600 mb-3">
                            Enter 1-5 job URLs you're interested in. We'll analyze them and create a roadmap with the most important skills across all jobs.
                            <br />
                            <span className="text-xs text-gray-500">
                                ⚠️ Note: Some sites (Indeed, LinkedIn) have bot protection and may not work.
                            </span>
                        </p>
                        <div className="space-y-2">
                            {jobUrls.map((url, index) => (
                                <input
                                    key={index}
                                    type="url"
                                    value={url}
                                    onChange={(e) => {
                                        const newUrls = [...jobUrls];
                                        newUrls[index] = e.target.value;
                                        setJobUrls(newUrls);
                                    }}
                                    placeholder={`Job ${index + 1} URL ${index === 0 ? '(required)' : '(optional)'}`}
                                    className="w-full p-3 border rounded"
                                />
                            ))}
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