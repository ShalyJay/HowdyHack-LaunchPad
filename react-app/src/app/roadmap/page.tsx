'use client';

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
            <div className="w-full max-w-2xl">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Your Learning Roadmap
                    </h1>

                    <RoadmapTimeline modules={modules} />

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
                            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/40 transition-all backdrop-blur-sm border border-white/30"
                        >
                            Create New Roadmap
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
