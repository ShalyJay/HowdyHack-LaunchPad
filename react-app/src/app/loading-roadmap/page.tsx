'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';

export default function LoadingRoadmapPage() {
    const router = useRouter();
    const {
        fileData,
        skills,
        jobUrls,
        timeFrameMonths,
        daysPerWeek,
        studyIntensity,
        setModules,
        setResponse,
        loading,
        setLoading,
        loadingProgress,
        setLoadingProgress
    } = useRoadmap();

    // Generate roadmap on component mount
    useEffect(() => {
        generateRoadmap();
    }, []);

    // Navigate to roadmap when modules are set
    useEffect(() => {
        if (!loading && loadingProgress === 100) {
            // Small delay to show 100% completion
            setTimeout(() => {
                router.push('/roadmap');
            }, 500);
        }
    }, [loading, loadingProgress, router]);

    const generateRoadmap = async () => {
        const filledUrls = jobUrls.filter(url => url.trim() !== "");

        setLoading(true);
        setLoadingProgress(10); // Start progress
        setResponse("");

        // Simulate gradual progress during the long API call
        const progressInterval = setInterval(() => {
            setLoadingProgress((prev: number) => {
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

                    const parsed = JSON.parse(jsonText);

                    console.log("=== PARSED RESPONSE ===");
                    console.log("Full parsed:", parsed);
                    console.log("=====================");

                    // Normal roadmap response
                    console.log("jobPostingPreview:", parsed.jobPostingPreview);
                    console.log("jobRequirements:", parsed.jobRequirements);

                    // Add schedule metadata to parsed object (start date = today)
                    parsed.startDate = new Date().toISOString().split('T')[0];
                    parsed.daysPerWeek = daysPerWeek;

                    // Set the entire parsed object (includes jobPostingPreview, jobRequirements, etc.)
                    setModules(parsed);
                    setResponse(""); // Clear text response since we have modules
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

        } catch (error) {
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
            </div>
        </div>
    );
}
