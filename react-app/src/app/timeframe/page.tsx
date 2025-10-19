'use client';

import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';

export default function TimeframePage() {
    const router = useRouter();
    const {
        timeFrameMonths,
        setTimeFrameMonths,
        daysPerWeek,
        setDaysPerWeek,
        studyIntensity,
        setStudyIntensity
    } = useRoadmap();

    const handleNext = () => {
        router.push('/jobs');
    };

    const handleBack = () => {
        router.push('/resume');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Set Your Time Frame
                    </h1>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Time Frame (months)</label>
                            <select
                                value={timeFrameMonths}
                                onChange={(e) => setTimeFrameMonths(Number(e.target.value))}
                                className="w-full p-3 border rounded"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} {i + 1 === 1 ? 'month' : 'months'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Days per week</label>
                            <select
                                value={daysPerWeek}
                                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                                className="w-full p-3 border rounded"
                            >
                                {[...Array(7)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} {i + 1 === 1 ? 'day' : 'days'} per week
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2">Study Intensity</label>
                        <select
                            value={studyIntensity}
                            onChange={(e) => setStudyIntensity(e.target.value)}
                            className="w-full p-3 border rounded"
                        >
                            <option value="light">Light (1-2 hours/day)</option>
                            <option value="moderate">Moderate (2-3 hours/day)</option>
                            <option value="intensive">Intensive (3-4 hours/day)</option>
                        </select>
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
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
