'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Form() {
    // form input states
    const [resume, setResume] = useState<File | null>(null);        //resume input
    const [fileData, setFileData] = useState<string | null>(null);  //base64 resume data for API
    const [skills, setSkills] = useState("");                       //skills text input
    const [jobReqs, setJobReqs] = useState("");                     //job qualifications input (paste for now, links later)
    const [response, setResponse] = useState("");                   //Gemini API response
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
            let prompt = `Analyze the resume and skills provided. Create a learning 
            roadmap to help achieve the job requirements. List main skills and experience, 
            identify gaps, and suggest a step-by-step learning path.`;
        

            // Add job requirements to prompt if provided
            if (jobReqs && jobReqs.trim()) {
                prompt += `\n\nJob Requirements:\n${jobReqs}`;
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
            setResponse(data.text || data.error || "No response");
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
                            

            </div>
        </div>
    );
}