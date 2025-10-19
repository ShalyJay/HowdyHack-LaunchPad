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
            // Base prompt for Gemini
            let prompt = `You are a career advisor creating a PERSONALIZED learning roadmap.

            CURRENT SKILLS/EXPERIENCE:
            ${skills ? `Skills: ${skills}` : ''}
            ${fileData ? 'Resume: (PDF provided)' : ''}

            TASK:
            1. Analyze the user's CURRENT skills and experience (from resume/skills 
            above)
            2. If job URLs are provided below, FETCH and READ the job postings to 
            understand requirements
            3. Compare current skills to job requirements
            4. Identify SKILL GAPS (what's missing to qualify for these jobs)
            5. Create a step-by-step learning roadmap to bridge those gaps

            Return your response as valid JSON in this exact format:
            {
                "currentSkills": ["skill1", "skill2"],
                "missingSkills": ["skill3", "skill4"],
                "modules": [
                {
                    "title": "Module name (e.g., 'Master React Fundamentals')",
                    "duration": "estimated time (e.g., '2-3 weeks')",
                    "skills": ["specific skills learned in this module"],
                    "description": "What you'll learn and why it's needed for the target jobs",
                    "resources": ["Free resource 1", "Free resource 2", "Free resource 3"]
                }
                ]
            }

            IMPORTANT:
            - Create 4-6 modules in LOGICAL ORDER (foundation → advanced)
            - Each module should build on the previous one
            - Focus ONLY on skills needed to qualify for the target job(s)
            - Provide at least 3 FREE learning resources per module (courses, docs, 
            tutorials)
            - Make it actionable and realistic for someone currently at their skill 
            level`;
        

            // Add job requirements to prompt if provided
            if (jobReqs && jobReqs.trim()) {
                prompt += `\n\nTARGET JOB(S):\n${jobReqs}\n\nFetch and analyze these 
                    job postings to understand the exact requirements.`;
            }

            const res = await fetch("/api/gemini-rest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    fileData: fileData,
                    skills: skills
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
                    setModules(parsed.modules || []);
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
                        <label className="block mb-2">Job Links (one per line)</label>
                        <textarea
                            value={jobReqs}
                            onChange={(e) => setJobReqs(e.target.value)}
                            placeholder="https://example.com/job1"
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