'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';
import RoadmapTimeline from '../components/RoadmapTimeline';

export default function RoadmapPage() {
    const router = useRouter();
    const {
        modules,
        response,
        setResume,
        setFileData,
        setSkills,
        setJobUrls,
        setTimeFrameMonths,
        setDaysPerWeek,
        setStudyIntensity,
        setModules,
        setResponse,
        setLoadingProgress
    } = useRoadmap();

    // Memoize modules to prevent unnecessary re-renders
    const stableModules = useMemo(() => modules, [JSON.stringify(modules)]);

    // Redirect to loading-roadmap if no modules (user navigated directly to /roadmap)
    useEffect(() => {
        if (!stableModules || (Array.isArray(stableModules) && stableModules.length === 0)) {
            router.push('/loading-roadmap');
        }
    }, [stableModules, router]);

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

        // Navigate to resume page
        router.push('/resume');
    };

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

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleCreateNew}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(236, 72, 153, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.4)';
                            }}
                        >
                            Create New Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
