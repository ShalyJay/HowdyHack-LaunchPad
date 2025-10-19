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
                            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30"
                        >
                            Generate Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
