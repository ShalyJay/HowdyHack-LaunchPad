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

    // Handle both formats: array of modules OR object with job requirements
    const moduleArray = Array.isArray(modules) ? modules : modules?.modules || [];

    // Memoize the module array length to detect actual changes
    const moduleCount = useMemo(() => {
        return moduleArray.length;
    }, [moduleArray.length]);

    // Reset expanded modules only when the number of modules actually changes (not on initial mount)
    useEffect(() => {
        if (previousModuleCountRef.current !== 0 && previousModuleCountRef.current !== moduleCount) {
            setExpandedModules(new Set());
        }
        previousModuleCountRef.current = moduleCount;
    }, [moduleCount]);

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
                    border: '1px solid rgba(var(--purple-main-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--purple-main-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--purple-light)', fontWeight: '600' }}>
                        📊 Analyzed {totalJobsAnalyzed} Job{totalJobsAnalyzed > 1 ? 's' : ''}
                        {similarJobs === false && ' (⚠️ Different Career Paths)'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{jobSummary}</p>
                </div>
            )}

            {/* NEW: Technology frequency breakdown */}
            {technologyFrequency && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '1px solid rgba(var(--blue-main-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--blue-main-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--blue-light)', fontWeight: '600' }}>🔍 Technology Frequency Analysis</h3>
                    {technologyFrequency.critical && technologyFrequency.critical.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: 'var(--pink-light)', fontWeight: 'bold' }}>
                                🔥 CRITICAL (All {totalJobsAnalyzed} jobs): {technologyFrequency.critical.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.high && technologyFrequency.high.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: 'var(--purple-light)', fontWeight: 'bold' }}>
                                ⭐ HIGH (50%+ jobs): {technologyFrequency.high.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.medium && technologyFrequency.medium.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: 'var(--blue-light)' }}>
                                📌 MEDIUM (2+ jobs): {technologyFrequency.medium.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.low && technologyFrequency.low.length > 0 && (
                        <div>
                            <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>
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
                    border: '1px solid rgba(var(--purple-light-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--purple-light-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--purple-light)', fontWeight: '600' }}>🔍 What Gemini Read from URL:</h3>
                    <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{jobPostingPreview}</p>
                </div>
            )}

            {/* Show extracted job requirements */}
            {jobRequirements && jobRequirements.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '1px solid rgba(var(--blue-light-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--blue-main-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--blue-light)', fontWeight: '600' }}>📋 Job Requirements (Technologies Needed):</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>{jobRequirements.join(', ')}</strong></p>
                </div>
            )}

            {/* Show user's current skills */}
            {currentSkills && currentSkills.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '1px solid rgba(var(--purple-main-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--purple-main-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--purple-light)', fontWeight: '600' }}>✅ Your Current Skills:</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{currentSkills.join(', ')}</p>
                </div>
            )}

            {/* Show missing skills (gaps) */}
            {missingSkills && missingSkills.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '16px',
                    border: '1px solid rgba(var(--pink-main-rgb), 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(var(--pink-main-rgb), 0.05)'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--pink-light)', fontWeight: '600' }}>🎯 Skills You Need to Learn:</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}><strong>{missingSkills.join(', ')}</strong></p>
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
                    // Priority badge colors - minimalist antique space theme
                    const priorityColors: any = {
                        critical: {
                            bg: 'rgba(var(--pink-main-rgb), 0.08)',
                            border: 'rgba(var(--pink-main-rgb), 0.4)',
                            text: 'var(--pink-dark)',
                            label: '🔥 CRITICAL'
                        },
                        high: {
                            bg: 'rgba(var(--purple-main-rgb), 0.08)',
                            border: 'rgba(var(--purple-main-rgb), 0.4)',
                            text: 'var(--purple-dark)',
                            label: '⭐ HIGH'
                        },
                        medium: {
                            bg: 'rgba(var(--blue-main-rgb), 0.08)',
                            border: 'rgba(var(--blue-main-rgb), 0.4)',
                            text: 'var(--blue-dark)',
                            label: '📌 MEDIUM'
                        },
                        low: {
                            bg: 'rgba(var(--slate-rgb), 0.05)',
                            border: 'rgba(var(--text-muted), 0.3)',
                            text: 'var(--text-muted)',
                            label: '💡 LOW'
                        }
                    };
                    const priorityStyle = module.priority ? priorityColors[module.priority] : null;

                const isExpanded = expandedModules.has(index);

                return (
                    <div key={index} style={{
                        marginBottom: '16px',
                        border: priorityStyle ? `1px solid ${priorityStyle.border}` : '1px solid rgba(var(--text-muted), 0.2)',
                        borderRadius: '8px',
                        background: priorityStyle ? priorityStyle.bg : 'rgba(var(--slate-rgb), 0.05)',
                        color: 'var(--text-primary)',
                        overflow: 'hidden'
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
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600' }}>{module.title}</h3>
                                    {priorityStyle && (
                                        <span style={{
                                            padding: '4px 10px',
                                            background: 'rgba(255, 255, 255, 0.5)',
                                            border: `1px solid ${priorityStyle.border}`,
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            color: priorityStyle.text
                                        }}>
                                            {priorityStyle.label}
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    {module.duration} • {module.skills.join(', ')}
                                </p>
                            </div>
                            <div style={{
                                fontSize: '24px',
                                color: 'var(--text-secondary)',
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
