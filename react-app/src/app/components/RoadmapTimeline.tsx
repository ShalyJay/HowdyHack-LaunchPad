'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

interface Module {
    title: string;
    duration: string;
    skills: string[];
    description: string;
    resources: string[];
}

interface RoadmapTimelineProps {
    modules: any; // Can be Module[] or { jobRequirements, currentSkills, missingSkills, modules }
}

// receives array of module objects OR full roadmap data --> displays roadmap
export default function RoadmapTimeline({ modules }: RoadmapTimelineProps)
{
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
    const previousModuleCountRef = useRef<number>(0);

    console.log('🎨 RoadmapTimeline RENDER - modules:', modules);

    // Handle both formats: array of modules OR object with job requirements
    const moduleArray = Array.isArray(modules) ? modules : modules?.modules || [];

    // Memoize the module array length to detect actual changes
    const moduleCount = useMemo(() => {
        console.log('📊 useMemo recalculating moduleCount:', moduleArray.length);
        return moduleArray.length;
    }, [moduleArray.length]);

    // Reset expanded modules only when the number of modules actually changes (not on initial mount)
    useEffect(() => {
        console.log('🔄 useEffect [moduleCount] triggered. prev:', previousModuleCountRef.current, 'current:', moduleCount);
        if (previousModuleCountRef.current !== 0 && previousModuleCountRef.current !== moduleCount) {
            console.log('⚠️ Module count changed! Resetting expanded modules');
            setExpandedModules(new Set());
        }
        previousModuleCountRef.current = moduleCount;
    }, [moduleCount]);

    console.log('moduleArray length:', moduleArray.length);

    const toggleModule = (index: number) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedModules(newExpanded);
    };

    // Old format (single job)
    const jobRequirements = !Array.isArray(modules) ? modules?.jobRequirements : null;
    const currentSkills = !Array.isArray(modules) ? modules?.currentSkills : null;
    const missingSkills = !Array.isArray(modules) ? modules?.missingSkills : null;
    const jobPostingPreview = !Array.isArray(modules) ? modules?.jobPostingPreview : null;

    // New format (multi-job aggregation)
    const similarJobs = !Array.isArray(modules) ? modules?.similarJobs : null;
    const totalJobsAnalyzed = !Array.isArray(modules) ? modules?.totalJobsAnalyzed : null;
    const jobSummary = !Array.isArray(modules) ? modules?.jobSummary : null;
    const technologyFrequency = !Array.isArray(modules) ? modules?.technologyFrequency : null;
    const missingSkillsByPriority = !Array.isArray(modules) ? modules?.missingSkills : null;

    // Schedule metadata
    const startDate = !Array.isArray(modules) ? modules?.startDate : null;
    const daysPerWeek = !Array.isArray(modules) ? modules?.daysPerWeek : 5;

    // If no modules, don't show anything
    if (!moduleArray || moduleArray.length === 0) {
        console.log('Returning null - no modules found');
        return null;
    }

    // Helper function to calculate due date for a specific day
    const calculateDueDate = (weekNumber: number, dayNumber: number): string => {
        if (!startDate) return '';

        const start = new Date(startDate);
        // Calculate total study days elapsed
        const totalDaysElapsed = (weekNumber - 1) * daysPerWeek + (dayNumber - 1);

        // Add days to start date
        const dueDate = new Date(start);
        dueDate.setDate(start.getDate() + totalDaysElapsed);

        // Format as "Mon, Jan 15"
        return dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>
            {/* LEFT: Analysis & Summary - Sticky */}
            <div style={{ position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
                <h2 style={{ marginTop: 0, marginBottom: '12px' }}>Analysis</h2>
                <div>

            {/* NEW: Multi-job aggregation summary */}
            {totalJobsAnalyzed && jobSummary && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#b794f6', fontWeight: '600' }}>
                        📊 Analyzed {totalJobsAnalyzed} Job{totalJobsAnalyzed > 1 ? 's' : ''}
                        {similarJobs === false && ' (⚠️ Different Career Paths)'}
                    </h3>
                    <p style={{ margin: 0, color: '#cbd5e1' }}>{jobSummary}</p>
                </div>
            )}

            {/* NEW: Technology frequency breakdown */}
            {technologyFrequency && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#93c5fd', fontWeight: '600' }}>🔍 Technology Frequency Analysis</h3>
                    {technologyFrequency.critical && technologyFrequency.critical.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#f9a8d4', fontWeight: 'bold' }}>
                                🔥 CRITICAL (All {totalJobsAnalyzed} jobs): {technologyFrequency.critical.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.high && technologyFrequency.high.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#b794f6', fontWeight: 'bold' }}>
                                ⭐ HIGH (50%+ jobs): {technologyFrequency.high.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.medium && technologyFrequency.medium.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#93c5fd' }}>
                                📌 MEDIUM (2+ jobs): {technologyFrequency.medium.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.low && technologyFrequency.low.length > 0 && (
                        <div>
                            <p style={{ margin: '5px 0', color: '#94a3b8' }}>
                                💡 LOW (1 job): {technologyFrequency.low.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* DEBUG: Show what Gemini read from the URL */}
            {jobPostingPreview && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(183, 148, 246, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(183, 148, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(183, 148, 246, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#b794f6', fontWeight: '600' }}>🔍 What Gemini Read from URL:</h3>
                    <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#cbd5e1' }}>{jobPostingPreview}</p>
                </div>
            )}

            {/* Show extracted job requirements */}
            {jobRequirements && jobRequirements.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(147, 197, 253, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#93c5fd', fontWeight: '600' }}>📋 Job Requirements (Technologies Needed):</h3>
                    <p style={{ margin: 0, color: '#cbd5e1' }}><strong>{jobRequirements.join(', ')}</strong></p>
                </div>
            )}

            {/* Show user's current skills */}
            {currentSkills && currentSkills.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(147, 51, 234, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(183, 148, 246, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#b794f6', fontWeight: '600' }}>✅ Your Current Skills:</h3>
                    <p style={{ margin: 0, color: '#cbd5e1' }}>{currentSkills.join(', ')}</p>
                </div>
            )}

            {/* Show missing skills (gaps) */}
            {missingSkills && missingSkills.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '2px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(249, 168, 212, 0.1) 100%)',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#f9a8d4', fontWeight: '600' }}>🎯 Skills You Need to Learn:</h3>
                    <p style={{ margin: 0, color: '#cbd5e1' }}><strong>{missingSkills.join(', ')}</strong></p>
                </div>
            )}
                </div>
            </div>

            {/* RIGHT: Learning Modules - Scrollable */}
            <div>
                <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Learning Modules</h2>

            {/* Loop through each module */}
            {(() => {
                let globalWeekCounter = 0; // Track continuous week numbers across all modules

                return moduleArray.map((module: any, index: number) => {
                    // Priority badge colors - space theme
                    const priorityColors: any = {
                        critical: {
                            bg: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)',
                            border: 'rgba(236, 72, 153, 0.4)',
                            text: '#f9a8d4',
                            label: '🔥 CRITICAL',
                            shadow: '0 4px 20px rgba(236, 72, 153, 0.2)'
                        },
                        high: {
                            bg: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                            border: 'rgba(147, 51, 234, 0.4)',
                            text: '#b794f6',
                            label: '⭐ HIGH',
                            shadow: '0 4px 20px rgba(147, 51, 234, 0.2)'
                        },
                        medium: {
                            bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
                            border: 'rgba(59, 130, 246, 0.4)',
                            text: '#93c5fd',
                            label: '📌 MEDIUM',
                            shadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
                        },
                        low: {
                            bg: 'rgba(71, 85, 105, 0.2)',
                            border: 'rgba(148, 163, 184, 0.3)',
                            text: '#94a3b8',
                            label: '💡 LOW',
                            shadow: '0 4px 15px rgba(71, 85, 105, 0.2)'
                        }
                    };
                    const priorityStyle = module.priority ? priorityColors[module.priority] : null;

                const isExpanded = expandedModules.has(index);

                return (
                    <div key={index} style={{
                        marginBottom: '16px',
                        border: priorityStyle ? `2px solid ${priorityStyle.border}` : '2px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '12px',
                        background: priorityStyle ? priorityStyle.bg : 'rgba(71, 85, 105, 0.1)',
                        color: '#f8fafc',
                        overflow: 'hidden',
                        boxShadow: priorityStyle ? priorityStyle.shadow : '0 4px 15px rgba(71, 85, 105, 0.2)'
                    }}>
                        {/* Header - Always Visible */}
                        <div
                            onClick={() => toggleModule(index)}
                            style={{
                                padding: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                userSelect: 'none'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px', fontWeight: '600' }}>{module.title}</h3>
                                    {priorityStyle && (
                                        <span style={{
                                            padding: '5px 12px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: `2px solid ${priorityStyle.border}`,
                                            borderRadius: '16px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            color: priorityStyle.text,
                                            boxShadow: `0 0 10px ${priorityStyle.border}`
                                        }}>
                                            {priorityStyle.label}
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '14px' }}>
                                    {module.duration} • {module.skills.join(', ')}
                                </p>
                            </div>
                            <div style={{
                                fontSize: '24px',
                                color: '#cbd5e1',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                            <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                <p style={{ color: '#444', marginTop: '12px' }}>{module.description}</p>

                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ color: '#444', fontWeight: 'bold', marginBottom: '8px' }}>Skills:</p>
                                    {module.skills.map((skill: string, skillIndex: number) => (
                                        <span key={skillIndex} style={{ marginRight: '8px', marginBottom: '8px', display: 'inline-block', padding: '4px 10px', backgroundColor: '#e0e0e0', borderRadius: '4px', color: '#333', fontSize: '13px' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                    {/* Weekly Breakdown with Daily Plan - Coursera style */}
                    {module.weeklyBreakdown && module.weeklyBreakdown.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                            <p style={{ color: '#444', fontWeight: 'bold', marginBottom: '10px' }}>📅 Week-by-Week Study Plan:</p>
                            {(() => {
                                let moduleDayCounter = 0; // Track continuous day numbers within this module

                                return module.weeklyBreakdown.map((week: any, weekIndex: number) => {
                                    globalWeekCounter++; // Increment for each week across all modules
                                    return (
                                        <div key={weekIndex} style={{
                                            marginBottom: '16px',
                                            padding: '14px',
                                            backgroundColor: '#f0f7ff',
                                            border: '2px solid #4CAF50',
                                            borderRadius: '8px'
                                        }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <strong style={{ color: '#2e7d32', fontSize: '16px' }}>Week {globalWeekCounter}</strong>
                                                <p style={{ color: '#555', fontSize: '14px', margin: '6px 0', fontStyle: 'italic' }}>
                                                    🎯 {week.weeklyGoal}
                                                </p>
                                            </div>

                                            {/* Daily Plan */}
                                            {week.dailyPlan && week.dailyPlan.length > 0 && (
                                                <div style={{ marginTop: '10px' }}>
                                                    {week.dailyPlan.map((day: any, dayIndex: number) => {
                                                        moduleDayCounter++; // Increment day counter for this module
                                                        const dueDate = calculateDueDate(globalWeekCounter, day.day);
                                                        return (
                                                            <div key={dayIndex} style={{
                                                                marginBottom: '10px',
                                                                padding: '12px',
                                                                backgroundColor: 'white',
                                                                borderLeft: '3px solid #2196F3',
                                                                borderRadius: '4px'
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <strong style={{ color: '#1976d2', fontSize: '14px' }}>Day {moduleDayCounter}: {day.topic}</strong>
                                                                        {dueDate && (
                                                                            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                                                                📅 Due: {dueDate}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span style={{ fontSize: '11px', color: '#666', backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '10px', marginLeft: '10px' }}>
                                                                        {day.estimatedHours}
                                                                    </span>
                                                                </div>
                                                                <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
                                                                    {day.tasks.map((task: string, taskIndex: number) => (
                                                                        <li key={taskIndex} style={{ color: '#444', fontSize: '13px', marginBottom: '2px' }}>
                                                                            {task}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    )}

                    {module.resources && module.resources.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                            <p style={{ color: '#444' }}><strong>Resources:</strong></p>
                            <ul style={{ color: '#444' }}>
                                {module.resources.map((resource: string, resourceIndex: number) => (
                                    <li key={resourceIndex}>{resource}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                            </div>
                        )}
                    </div>
                );
            });
            })()}
            </div>
        </div>
    );
}
