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
    const [timeFrameMonths, setTimeFrameMonths] = useState<number>(3); //time frame in months (1-12)
    const [daysPerWeek, setDaysPerWeek] = useState<number>(5); //days per week to study (1-7)
    const [studyIntensity, setStudyIntensity] = useState<string>("moderate"); //light, moderate, or intensive
    const [response, setResponse] = useState("");                   //Gemini API response
    const [modules, setModules] = useState<any[]>([]);              //Parsed roadmap
    const [loading, setLoading] = useState(false);                  //loading state while API
    const [loadingProgress, setLoadingProgress] = useState(0);      //progress percentage (0-100)
    const [currentStep, setCurrentStep] = useState(0);              //wizard step (0=resume, 1=timeframe, 2=jobs, 3=loading, 4=roadmap)

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

    // Handle next button for each step
    const handleNext = () => {
        if (currentStep === 0) {
            // Validate resume/skills
            if (!fileData && !skills.trim()) {
                alert("Please upload a resume or enter skills (or both)!");
                return;
            }
            setCurrentStep(1);
        } else if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validate job URLs
            const filledUrls = jobUrls.filter(url => url.trim() !== "");
            if (filledUrls.length === 0) {
                alert("Please enter at least one job posting URL!");
                return;
            }
            // Move to loading screen and generate roadmap
            setCurrentStep(3);
            generateRoadmap();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Generate roadmap
    const generateRoadmap = async () => {
        const filledUrls = jobUrls.filter(url => url.trim() !== "");

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
            TIME CONSTRAINT: The user has ${timeFrameMonths} months and will study ${daysPerWeek} days per week.
            STUDY INTENSITY: ${studyIntensity} - ${studyIntensity === 'light' ? '1-2 hours/day' : studyIntensity === 'moderate' ? '2-3 hours/day' : '3-4 hours/day'}
            Structure the learning plan to fit within approximately ${timeFrameMonths * 4} weeks total.

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
                    "dailyPlan": [
                        {
                        "day": 1,
                        "topic": "Introduction to Docker & Containers",
                        "tasks": ["Watch Docker intro video", "Install Docker Desktop", "Understand containers vs VMs"],
                        "estimatedHours": "2 hours"
                        },
                        {
                        "day": 2,
                        "topic": "Basic Docker Commands",
                        "tasks": ["Learn docker run, ps, stop", "Pull and run official images", "Practice with nginx container"],
                        "estimatedHours": "2 hours"
                        },
                        {
                        "day": 3,
                        "topic": "Working with Images",
                        "tasks": ["Understand Docker images", "Learn docker pull, images, rmi", "Explore Docker Hub"],
                        "estimatedHours": "1.5 hours"
                        }
                    ],
                    "weeklyGoal": "Understand containerization basics and run your first containers"
                    },
                    {
                    "week": 2,
                    "dailyPlan": [
                        {
                        "day": 1,
                        "topic": "Creating Dockerfiles",
                        "tasks": ["Learn Dockerfile syntax", "Create a simple Dockerfile", "Build your first image"],
                        "estimatedHours": "2 hours"
                        }
                    ],
                    "weeklyGoal": "Build and manage custom Docker images"
                    }
                ],
                "resources": ["Docker Official Tutorial", "FreeCodeCamp Docker Course", "Docker Practice Labs"]
                }
            ]
            }

            CRITICAL REQUIREMENTS:
            - MAXIMUM 7 MODULES (technologies) - Be selective! Choose the most industry-relevant technologies
            - TIME FRAME: ${timeFrameMonths} months, ${daysPerWeek} days/week - Total ~${timeFrameMonths * 4} weeks
            - Each module = ONE technology with a "weeklyBreakdown" array
            - Each week in weeklyBreakdown should have:
              * "week": number (1, 2, 3, etc. within that module)
              * "dailyPlan": array with ${daysPerWeek} study days (Day 1, Day 2, etc.)
              * "weeklyGoal": what the learner achieves by week end
            - Each day in dailyPlan should have:
              * "day": number (1-${daysPerWeek})
              * "topic": specific topic for that day
              * "tasks": array of 2-4 concrete tasks to complete
              * "estimatedHours": realistic hours matching ${studyIntensity} intensity (${studyIntensity === 'light' ? '1-2 hours' : studyIntensity === 'moderate' ? '2-3 hours' : '3-4 hours'})
            - If jobs are TOO DIFFERENT (unrelated career paths), set "similarJobs": false and mention this in jobSummary
            - ONLY create modules for technologies in "missingSkills"
            - Include "priority" field in each module (critical/high/medium/low)
            - Start with CRITICAL priority modules first, then HIGH, then MEDIUM
            - Provide 3+ FREE resources per module
            - Set realistic "duration" (in weeks) based on ${timeFrameMonths} months constraint`;

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

                    // Add schedule metadata to parsed object (start date = today)
                    parsed.startDate = new Date().toISOString().split('T')[0];
                    parsed.daysPerWeek = daysPerWeek;

                    // Set the entire parsed object (includes jobPostingPreview, jobRequirements, etc.)
                    setModules(parsed);
                    setResponse(""); // Clear text response since we have modules
                    setCurrentStep(4); // Move to roadmap display

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

                {/* Step 0: Resume & Skills */}
                {currentStep === 0 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Upload Resume & Skills
                        </h1>

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

                        <div className="flex justify-between mt-8">
                            <Link href="/">
                                <button type="button" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all">
                                    Back to Home
                                </button>
                            </Link>
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Time Frame */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Time Frame & Study Plan
                        </h1>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">Time Frame (months)</label>
                                <select
                                    value={timeFrameMonths}
                                    onChange={(e) => setTimeFrameMonths(Number(e.target.value))}
                                    className="w-full p-3 border rounded"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Days per week</label>
                                <select
                                    value={daysPerWeek}
                                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                                    className="w-full p-3 border rounded"
                                >
                                    {[...Array(7)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} {i + 1 === 1 ? 'day' : 'days'} per week
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block mb-2">Study Intensity</label>
                            <select
                                value={studyIntensity}
                                onChange={(e) => setStudyIntensity(e.target.value)}
                                className="w-full p-3 border rounded"
                            >
                                <option value="light">Light (1-2 hours/day)</option>
                                <option value="moderate">Moderate (2-3 hours/day)</option>
                                <option value="intensive">Intensive (3-4 hours/day)</option>
                            </select>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Job Postings */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Job Posting URLs
                        </h1>

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

                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Generate Roadmap
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Loading */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Generating Your Roadmap
                        </h1>

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
                    </div>
                )}

                {/* Step 4: Roadmap */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Your Learning Roadmap
                        </h1>

                        <RoadmapTimeline modules={modules} />

                        {/* fallback: show text response if json parsing failed */}
                        {response && (
                            <div className="mt-8 p-4 border rounded">
                                <h2 className="text-xl font-bold mb-4">Your Learning Roadmap:</h2>
                                <div className="whitespace-pre-wrap">
                                    {response}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={() => setCurrentStep(0)}
                                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30"
                            >
                                Create New Roadmap
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}