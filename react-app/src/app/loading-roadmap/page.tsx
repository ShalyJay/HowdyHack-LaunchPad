'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';
import RoadmapTimeline from '../components/RoadmapTimeline';

export default function LoadingRoadmapPage() {
    const router = useRouter();
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [studyTime, setStudyTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default
    const {
        fileData,
        skills,
        jobUrls,
        timeFrameMonths,
        daysPerWeek,
        studyIntensity,
        modules,
        response,
        setModules,
        setResponse,
        loading,
        setLoading,
        loadingProgress,
        setLoadingProgress,
        setResume,
        setFileData,
        setSkills,
        setJobUrls,
        setTimeFrameMonths,
        setDaysPerWeek,
        setStudyIntensity
    } = useRoadmap();

    // Store a stable reference to modules that only updates when content actually changes
    const stableModulesRef = useRef<any>(null);
    const modulesStringRef = useRef<string>('');

    const currentString = JSON.stringify(modules);

    if (modulesStringRef.current !== currentString) {
        console.log('📝 Modules content changed, updating stable reference');
        modulesStringRef.current = currentString;
        stableModulesRef.current = modules;
    } else {
        console.log('✅ Modules content unchanged');
    }

    const stableModules = stableModulesRef.current;

    // Check if modules already exist on mount (e.g., user refreshed)
    useEffect(() => {
        console.log('=== LOADING-ROADMAP MOUNT ===');
        console.log('modules:', modules);
        console.log('loading:', loading);
        console.log('loadingProgress:', loadingProgress);

        const hasModules = modules && (Array.isArray(modules) ? modules.length > 0 : (modules as any).modules?.length > 0);
        console.log('hasModules:', hasModules);

        if (hasModules) {
            // Already have roadmap data, just show it
            console.log('✅ Modules exist, showing roadmap');
            setLoadingProgress(100);
            setLoading(false);
        } else {
            // No data, generate fresh
            console.log('🔄 No modules, generating roadmap');
            setLoadingProgress(0);
            generateRoadmap();
        }
    }, []); // Empty deps - only run once on mount

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

                    // Different speeds for different phases - slower overall
                    let slowdownFactor;
                    if (prev < 10) {
                        // Starting phase: medium
                        slowdownFactor = 0.20;
                    } else if (prev < 40) {
                        // Early scraping: very slow
                        slowdownFactor = 0.02;
                    } else if (prev < 70) {
                        // Mid scraping: medium
                        slowdownFactor = 0.10;
                    } else if (prev < 90) {
                        // Analyzing phase: slow
                        slowdownFactor = 0.06;
                    } else {
                        // Final phase: very slow (building suspense)
                        slowdownFactor = 0.03;
                    }

                    const increment = (98 - prev) * slowdownFactor * randomFactor;
                    return Math.min(prev + increment, 98);
                }
                return prev;
            });
        }, 800); // Update every 800ms (slower than 600ms)

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
                setLoadingProgress(100);
                setLoading(false); // Set loading false after state updates
            } else if (data.text) {
                // Try to parse JSON from Gemini's response
                try {
                    let jsonText = data.text;

                    // Remove markdown wrappers
                    if (jsonText.includes('```json')) {
                      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
                    } else if (jsonText.includes('```')) {
                      jsonText = jsonText.split('```')[1].split('```')[0].trim();
                    }
                
                    // Extract JSON object
                    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                    if (jsonMatch) jsonText = jsonMatch[0];
                
                    // Sanitize invalid backslashes
                    jsonText = jsonText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\").trim();
                
                    const parsed = JSON.parse(jsonText);
                    console.log("=== PARSED RESPONSE ===", parsed);
                
                    setModules(parsed);
                    setResponse("");
                    setTimeout(() => {
                      setLoadingProgress(100);
                      setLoading(false);
                    }, 200);
                }catch (parseError) {
                    console.error("Failed to parse JSON:", parseError);
                    console.error("Raw response text:", data.text);
                    setResponse("⚠️ The AI generated an invalid response. Please try again.\n\nRaw response:\n" + data.text);
                    setModules([]);
                    setLoadingProgress(100);
                    setLoading(false);
                }                     

            } else {
                setResponse("No response");
                setModules([]);
                setLoadingProgress(100);
                setLoading(false); // Set loading false after state updates
            }
        } catch (error) {
            console.error(error);
            setResponse("Error connecting to Gemini API.");
            clearInterval(progressInterval); // Stop the interval on error
            setLoadingProgress(0); // Reset on error
            setLoading(false); // Set loading false after error handling
        }
    };

    const handleCreateNew = () => {
        // Reset all state
        setResume(null);
        setFileData(null);
        setSkills("");
        setJobUrls(["", "", "", "", ""]);
        setTimeFrameMonths(3);
        setDaysPerWeek(5);
        setStudyIntensity("moderate");
        setModules([]);
        setResponse("");
        setLoadingProgress(0);

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('roadmap-modules');
            localStorage.removeItem('roadmap-response');
        }

        // Navigate to resume page
        router.push('/resume');
    };

    const generateICSFile = () => {
        const moduleData = stableModules as any;
        const moduleArray = Array.isArray(moduleData) ? moduleData : moduleData?.modules || [];
        const startDate = moduleData?.startDate || new Date().toISOString().split('T')[0];

        let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Job Roadmap Generator//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n';

        let studyDayCounter = 0;
        const [hours, minutes] = studyTime.split(':');

        // Convert selected days (0-6) to RRULE day format (SU,MO,TU,WE,TH,FR,SA)
        const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDayString = selectedDays.map(day => dayMap[day]).join(',');

        moduleArray.forEach((module: any, moduleIndex: number) => {
            if (module.weeklyBreakdown && module.weeklyBreakdown.length > 0) {
                // Calculate total occurrences for this module
                let totalDays = 0;
                module.weeklyBreakdown.forEach((week: any) => {
                    if (week.dailyPlan && week.dailyPlan.length > 0) {
                        totalDays += week.dailyPlan.length;
                    }
                });

                if (totalDays > 0) {
                    // Find the first study day for this module
                    let currentDate = new Date(startDate);
                    let foundStudyDays = 0;

                    while (foundStudyDays < studyDayCounter) {
                        const dayOfWeek = currentDate.getDay();
                        if (selectedDays.includes(dayOfWeek)) {
                            foundStudyDays++;
                        }
                        if (foundStudyDays < studyDayCounter) {
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    }

                    // Ensure we're on a valid study day
                    while (!selectedDays.includes(currentDate.getDay())) {
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    const dateStr = currentDate.toISOString().split('T')[0].replace(/-/g, '');
                    const startTime = `${dateStr}T${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;

                    // Use average duration or default to 2 hours
                    let avgDuration = 2;
                    const firstDay = module.weeklyBreakdown[0]?.dailyPlan?.[0];
                    if (firstDay?.estimatedHours) {
                        const durationMatch = firstDay.estimatedHours.match(/(\d+\.?\d*)/);
                        avgDuration = durationMatch ? parseFloat(durationMatch[1]) : 2;
                    }

                    const endDate = new Date(currentDate);
                    endDate.setHours(parseInt(hours) + Math.floor(avgDuration));
                    endDate.setMinutes(parseInt(minutes) + ((avgDuration % 1) * 60));
                    const endTime = `${dateStr}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;

                    // Build description with all topics
                    let description = `Module: ${module.title}\\n\\n`;
                    description += `Topics covered:\\n`;
                    module.weeklyBreakdown.forEach((week: any, weekIdx: number) => {
                        if (week.dailyPlan && week.dailyPlan.length > 0) {
                            week.dailyPlan.forEach((day: any, dayIdx: number) => {
                                description += `Day ${studyDayCounter + weekIdx + dayIdx + 1}: ${day.topic}\\n`;
                            });
                        }
                    });

                    icsContent += `BEGIN:VEVENT\r\n`;
                    icsContent += `DTSTART:${startTime}\r\n`;
                    icsContent += `DTEND:${endTime}\r\n`;
                    icsContent += `RRULE:FREQ=DAILY;BYDAY=${byDayString};COUNT=${totalDays}\r\n`;
                    icsContent += `SUMMARY:${module.title}\r\n`;
                    icsContent += `DESCRIPTION:${description}\r\n`;
                    icsContent += `UID:module-${moduleIndex}@roadmap\r\n`;
                    icsContent += `END:VEVENT\r\n`;

                    studyDayCounter += totalDays;
                }
            }
        });

        icsContent += 'END:VCALENDAR\r\n';

        // Download the file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'learning-roadmap.ics';
        link.click();

        setShowCalendarModal(false);
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    console.log('=== RENDER ===');
    console.log('loading:', loading, 'loadingProgress:', loadingProgress);
    console.log('stableModules:', stableModules);

    // Show loading progress while generating
    if (loading || loadingProgress < 100) {
        console.log('📊 Showing loading screen');
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-2xl">
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center mb-8">
                            Generating Your Roadmap
                        </h1>

                        <div className="mt-6">
                            <div style={{
                                width: '100%',
                                height: '8px',
                                backgroundColor: 'rgba(var(--slate-rgb), 0.3)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid rgba(var(--text-muted), 0.2)'
                            }}>
                                <div style={{
                                    width: `${loadingProgress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--pink-main) 0%, var(--purple-main) 50%, var(--blue-main) 100%)',
                                    borderRadius: '12px',
                                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}></div>
                            </div>
                            <p style={{
                                textAlign: 'center',
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                marginTop: '12px',
                                fontWeight: '500'
                            }}>
                                {loadingProgress < 10 && "🚀 Starting analysis..."}
                                {loadingProgress >= 10 && loadingProgress < 70 && "🔍 Scraping job postings..."}
                                {loadingProgress >= 70 && loadingProgress < 90 && "⚡ Analyzing requirements..."}
                                {loadingProgress >= 90 && loadingProgress < 100 && "✨ Creating your roadmap..."}
                                {loadingProgress === 100 && "🎉 Complete!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show roadmap when complete
    console.log('✅ Showing roadmap');
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-7xl">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Your Learning Roadmap
                    </h1>

                    <RoadmapTimeline modules={stableModules} />

                    {/* Fallback: show text response if json parsing failed */}
                    {response && (
                        <div className="mt-8 p-4 border rounded">
                            <h2 className="text-xl font-bold mb-4">Your Learning Roadmap:</h2>
                            <div className="whitespace-pre-wrap">
                                {response}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => setShowCalendarModal(true)}
                            style={{
                                padding: '12px 20px',
                                background: 'var(--blue-main)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(61, 90, 117, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            📅 ⬇️
                        </button>
                        <button
                            onClick={handleCreateNew}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, var(--pink-main) 0%, var(--purple-main) 100%)',
                                color: 'var(--white)',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Create New Roadmap
                        </button>
                    </div>

                    {/* Calendar Download Modal */}
                    {showCalendarModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '32px',
                                borderRadius: '12px',
                                maxWidth: '500px',
                                width: '90%',
                                fontFamily: 'var(--font-archivo)'
                            }}>
                                <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: 'var(--font-orbitron)' }}>Calendar Settings</h2>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Study Time
                                    </label>
                                    <input
                                        type="time"
                                        value={studyTime}
                                        onChange={(e) => setStudyTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            fontFamily: 'var(--font-archivo)',
                                            letterSpacing: 'normal'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Study Days
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[
                                            { name: 'Sun', value: 0 },
                                            { name: 'Mon', value: 1 },
                                            { name: 'Tue', value: 2 },
                                            { name: 'Wed', value: 3 },
                                            { name: 'Thu', value: 4 },
                                            { name: 'Fri', value: 5 },
                                            { name: 'Sat', value: 6 }
                                        ].map(day => (
                                            <button
                                                key={day.value}
                                                onClick={() => toggleDay(day.value)}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: selectedDays.includes(day.value)
                                                        ? '2px solid var(--blue-main)'
                                                        : '2px solid #ddd',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedDays.includes(day.value)
                                                        ? 'var(--blue-main)'
                                                        : 'white',
                                                    color: selectedDays.includes(day.value)
                                                        ? 'white'
                                                        : 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {day.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowCalendarModal(false)}
                                        style={{
                                            padding: '10px 20px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={generateICSFile}
                                        disabled={selectedDays.length === 0}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            backgroundColor: selectedDays.length === 0 ? '#ccc' : 'var(--blue-main)',
                                            color: 'white',
                                            cursor: selectedDays.length === 0 ? 'not-allowed' : 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Download ICS
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
