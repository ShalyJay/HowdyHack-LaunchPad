'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Form() {
    // form input states
    const [resume, setResume] = useState<File | null>(null);    //resume input
    const [skills, setSkills] = useState("");                   //skills text input
    const [jobReqs, setJobReqs] = useState("");                 //job qualifications input (paste for now, links later)

    // resume upload
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    // entire form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log({ resume, skills, jobReqs});
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
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleResumeUpload}
                            className="w-full p-2 border rounded"
                        />
                        {resume && <p className="mt-2 text-sm" >Selected: {resume.name}</p>}
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
                            <button type="submit" className="px-6 py-3 bg-white/20 text-white rounded-full 
                                hover:bg-white/40 hover:scale-110 transition-all backdrop-blur-sm border 
                                border-white/30 cursor-pointer">
                                Generate Roadmap
                            </button>
                    </div>

                </form>
            </div>
        </div>
    );
}