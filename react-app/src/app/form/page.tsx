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
                <h1 className="text-3xl font-bold text-center mb-8">
                    Roadmap
                </h1>

                <form onSubmit={handleSubmit}>
                <div>
                    <label>Upload Resume</label>
                    <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    />
                    {resume && <p>Selected: {resume.name}</p>}
                </div>

                <div>
                    <label>Your Skills</label>
                    <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., JavaScript, React, Python..."
                    />
                </div>

                <div>
                    <label>Job Links (one per line)</label>
                    <textarea
                    value={jobReqs}
                    onChange={(e) => setJobReqs(e.target.value)}
                    placeholder="https://example.com/job1"
                    />
                </div>

                <div>
                    <Link href="/">
                    <button type="button">Back</button>
                    </Link>
                    <button type="submit">Generate Roadmap</button>
                </div>
                </form>
            </div>
        </div>
    );
}