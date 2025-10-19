'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoadmap } from '../context/RoadmapContext';
import RoadmapTimeline from '../components/RoadmapTimeline';

export default function RoadmapPage() {
    const router = useRouter();
    const {
        modules,
        response,
        daysPerWeek,
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

    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [studyTime, setStudyTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri by default

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

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('roadmap-modules');
            localStorage.removeItem('roadmap-response');
        }

        // Navigate to resume page
        router.push('/resume');
    };

    const generateICSFile = () => {
        const moduleData = stableModules as any;
        const moduleArray = Array.isArray(moduleData) ? moduleData : moduleData?.modules || [];
        const startDate = moduleData?.startDate || new Date().toISOString().split('T')[0];

        let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Job Roadmap Generator//EN\r\nCALSCALE:GREGORIAN\r\n';

        let dayCounter = 0;
        const [hours, minutes] = studyTime.split(':');

        moduleArray.forEach((module: any) => {
            if (module.weeklyBreakdown && module.weeklyBreakdown.length > 0) {
                module.weeklyBreakdown.forEach((week: any) => {
                    if (week.dailyPlan && week.dailyPlan.length > 0) {
                        week.dailyPlan.forEach((day: any) => {
                            // Calculate the actual date for this study day
                            const studyDate = new Date(startDate);

                            // Add days based on selected study days
                            let daysToAdd = 0;
                            let studyDaysCount = 0;
                            while (studyDaysCount < dayCounter) {
                                daysToAdd++;
                                const checkDate = new Date(startDate);
                                checkDate.setDate(checkDate.getDate() + daysToAdd);
                                const dayOfWeek = checkDate.getDay();
                                if (selectedDays.includes(dayOfWeek)) {
                                    studyDaysCount++;
                                }
                            }

                            studyDate.setDate(studyDate.getDate() + daysToAdd);

                            // Only create event if it falls on a selected day
                            const dayOfWeek = studyDate.getDay();
                            if (selectedDays.includes(dayOfWeek)) {
                                const dateStr = studyDate.toISOString().split('T')[0].replace(/-/g, '');
                                const startTime = `${dateStr}T${hours}${minutes}00`;

                                // Parse estimated hours (e.g., "2 hours" -> 2)
                                const durationMatch = day.estimatedHours?.match(/(\d+\.?\d*)/);
                                const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 2;

                                const endDate = new Date(studyDate);
                                endDate.setHours(parseInt(hours) + Math.floor(durationHours));
                                endDate.setMinutes(parseInt(minutes) + ((durationHours % 1) * 60));
                                const endTime = `${dateStr}T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;

                                const summary = `${module.title}: ${day.topic}`;
                                const description = day.tasks.join('\\n');

                                icsContent += `BEGIN:VEVENT\r\n`;
                                icsContent += `DTSTART:${startTime}\r\n`;
                                icsContent += `DTEND:${endTime}\r\n`;
                                icsContent += `SUMMARY:${summary}\r\n`;
                                icsContent += `DESCRIPTION:${description}\r\n`;
                                icsContent += `END:VEVENT\r\n`;
                            }

                            dayCounter++;
                        });
                    }
                });
            }
        });

        icsContent += 'END:VCALENDAR\r\n';

        // Download the file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'learning-roadmap.ics';
        link.click();

        setShowCalendarModal(false);
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-7xl">
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Your Learning Roadmap
                    </h1>

                    <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', backgroundColor: '#f0f0f0' }}>
                        <button
                            onClick={() => setShowCalendarModal(true)}
                            style={{
                                padding: '15px 30px',
                                marginRight: '10px',
                                fontSize: '18px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            📅 Download Calendar
                        </button>
                        <button
                            onClick={handleCreateNew}
                            style={{
                                padding: '15px 30px',
                                fontSize: '18px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Create New Roadmap
                        </button>
                    </div>

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

                    {/* Calendar Download Modal */}
                    {showCalendarModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '32px',
                                borderRadius: '12px',
                                maxWidth: '500px',
                                width: '90%',
                                fontFamily: 'var(--font-archivo)'
                            }}>
                                <h2 style={{ marginTop: 0, marginBottom: '24px', fontFamily: 'var(--font-orbitron)' }}>Calendar Settings</h2>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Study Time
                                    </label>
                                    <input
                                        type="time"
                                        value={studyTime}
                                        onChange={(e) => setStudyTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Study Days
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[
                                            { name: 'Sun', value: 0 },
                                            { name: 'Mon', value: 1 },
                                            { name: 'Tue', value: 2 },
                                            { name: 'Wed', value: 3 },
                                            { name: 'Thu', value: 4 },
                                            { name: 'Fri', value: 5 },
                                            { name: 'Sat', value: 6 }
                                        ].map(day => (
                                            <button
                                                key={day.value}
                                                onClick={() => toggleDay(day.value)}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: selectedDays.includes(day.value)
                                                        ? '2px solid var(--blue-main)'
                                                        : '2px solid #ddd',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedDays.includes(day.value)
                                                        ? 'var(--blue-main)'
                                                        : 'white',
                                                    color: selectedDays.includes(day.value)
                                                        ? 'white'
                                                        : 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {day.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => setShowCalendarModal(false)}
                                        style={{
                                            padding: '10px 20px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={generateICSFile}
                                        disabled={selectedDays.length === 0}
                                        style={{
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            backgroundColor: selectedDays.length === 0 ? '#ccc' : 'var(--blue-main)',
                                            color: 'white',
                                            cursor: selectedDays.length === 0 ? 'not-allowed' : 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >``
                                        Download ICS
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
