'use client';

import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';

export default function ResumePage() {
    const router = useRouter();
    const {
        resume,
        setResume,
        fileData,
        setFileData,
        skills,
        setSkills
    } = useRoadmap();

    // Resume upload handler
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if resume file is pdf
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

    // Validate and navigate to next step
    const handleNext = () => {
        if (!fileData && !skills.trim()) {
            alert("Please upload a resume or enter skills (or both)!");
            return;
        }
        router.push('/timeframe');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
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
                            style={{ backgroundColor: 'white', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="px-6 py-3 rounded-lg transition-all"
                            style={{ backgroundColor: 'white', color: 'black', border: '1px solid rgba(0,0,0,0.1)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 rounded-lg transition-all"
                            style={{ backgroundColor: 'black', color: 'white' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'black';
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
