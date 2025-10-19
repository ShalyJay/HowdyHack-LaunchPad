'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';

export default function JobsPage() {
    const router = useRouter();
    const { jobUrls, setJobUrls } = useRoadmap();
    const [visibleUrlInputs, setVisibleUrlInputs] = useState<number>(1);

    const handleNext = () => {
        // Validate job URLs
        const filledUrls = jobUrls.filter(url => url.trim() !== "");
        if (filledUrls.length === 0) {
            alert("Please enter at least one job posting URL!");
            return;
        }
        // Navigate to loading screen
        router.push('/loading-roadmap');
    };

    const handleBack = () => {
        router.push('/timeframe');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Add Job Postings
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
                                            style={{ backgroundColor: 'white', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
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
                            Generate Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
