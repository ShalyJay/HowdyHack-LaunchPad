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
    const [jobReqs, setJobReqs] = useState("");                     //job qualifications input (paste for now, links later)
    const [response, setResponse] = useState("");                   //Gemini API response
    const [modules, setModules] = useState<any[]>([]);              //Parsed roadmap
    const [loading, setLoading] = useState(false);                  //loading state while API

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
        console.log({resume, skills, jobReqs});

        // require resume, skills, or both
        if (!fileData && !skills.trim()) {
            alert("Please upload a resume or enter skills (or both)!");
            return;
        }

        setLoading(true);
        setResponse("");

        try {
            // Base prompt for Gemini - JOB-FOCUSED approach
            let prompt = `You are a career advisor creating a PERSONALIZED learning roadmap.

            STEP 1: READ THE JOB POSTING
            If a URL is provided, VISIT IT and read the entire page content.

            STEP 2: FIND AND COPY THE REQUIREMENTS SECTION
            Look for sections titled "Qualifications", "Requirements", "Minimum Qualifications", "Technical Requirements", or similar.
            Copy the EXACT TEXT from that section word-for-word.
            Put this in "jobPostingPreview" field.

            STEP 3: EXTRACT TECHNICAL REQUIREMENTS
            From the text you copied, identify ONLY the specific technologies that are explicitly named:
            - Programming languages (Java, Python, JavaScript, etc.)
            - Frameworks and libraries (React, Spring Boot, Django, etc.)
            - Databases (PostgreSQL, MongoDB, etc.)
            - Cloud platforms (AWS, Azure, GCP, etc.)
            - Tools (Docker, Git, etc.)

            CRITICAL:
            - If the section says "familiarity with programming" without naming languages → jobRequirements: []
            - If the section says "experience with Java, Ruby, Go" → jobRequirements: ["Java", "Ruby", "Go"]
            - ONLY include technologies that are EXPLICITLY NAMED in the text

            List these in the "jobRequirements" array.

            STEP 2: IDENTIFY USER'S CURRENT SKILLS
            USER'S CURRENT SKILLS/EXPERIENCE:
            ${skills ? `Skills: ${skills}` : 'No skills provided'}
            ${fileData ? 'Resume: (PDF provided with work history)' : 'No resume provided'}

            STEP 3: FIND THE GAPS
            Compare job requirements to user skills. What specific technologies does the user NOT have?

            STEP 4: CREATE ROADMAP FOR GAPS ONLY
            Create modules ONLY for the missing technical skills.

            Return your response as valid JSON in this exact format:
            {
            "jobPostingPreview": "EXACT TEXT copied from the Requirements/Qualifications section of the job posting",
            "jobRequirements": ["Java", "Ruby", "JavaScript"],
            "currentSkills": ["JavaScript", "React"],
            "missingSkills": ["Java", "Ruby"],
            "modules": [
                {
                "title": "Learn Java Fundamentals",
                "duration": "3-4 weeks",
                "skills": ["Java"],
                "description": "Master Java basics needed for Spring Boot development",
                "resources": ["Java Tutorial on Oracle Docs", "Java Course on Coursera", "Java Practice on HackerRank"]
                }
            ]
            }

            CRITICAL REQUIREMENTS:
            - "jobRequirements" must list SPECIFIC TECHNOLOGIES from the job posting, not generic skills
            - ONLY create modules for technologies in "missingSkills"
            - Each module focuses on ONE specific technology
            - Create 3-6 modules in learning order
            - Provide 3+ FREE resources per module`;

            // Add job requirements to prompt if provided
            if (jobReqs && jobReqs.trim()) {
                prompt += `\n\nTARGET JOB REQUIREMENTS:\n${jobReqs}\n\nAnalyze these job postings to understand what skills/qualifications are REQUIRED.`;
            }

            const res = await fetch("/api/gemini-rest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    fileData: fileData,
                    skills: skills,
                    jobReqs: jobReqs
                }),
            });

            const data = await res.json();
            
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
                    console.log("jobPostingPreview:", parsed.jobPostingPreview);
                    console.log("jobRequirements:", parsed.jobRequirements);
                    console.log("Full parsed:", parsed);
                    console.log("=====================");

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
                        <label className="block mb-2">Job Requirements</label>
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>Option 1:</strong> Paste a job posting URL (AI will try to read it - may not always work)
                            <br />
                            <strong>Option 2:</strong> Copy/paste the "Requirements" or "Qualifications" section text (more reliable)
                        </p>
                        <textarea
                            value={jobReqs}
                            onChange={(e) => setJobReqs(e.target.value)}
                            placeholder="Paste URL OR job requirements text:&#10;&#10;URL example: https://company.com/jobs/software-engineer&#10;&#10;Text example:&#10;• 3+ years with React, TypeScript&#10;• Experience with AWS, Docker&#10;• Strong Python skills"
                            className="w-full p-3 border rounded h-32"
                        />
                    </div>

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