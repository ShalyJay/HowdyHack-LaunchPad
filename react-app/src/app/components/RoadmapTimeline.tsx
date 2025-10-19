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
    console.log('RoadmapTimeline received modules:', modules);

    // Handle both formats: array of modules OR object with job requirements
    const moduleArray = Array.isArray(modules) ? modules : modules?.modules || [];

    console.log('moduleArray:', moduleArray);
    console.log('moduleArray length:', moduleArray.length);

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
        <div>
            {/* Analysis & Summary */}
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ marginTop: 0, marginBottom: '12px' }}>Analysis</h2>
                <div>

            {/* NEW: Multi-job aggregation summary */}
            {totalJobsAnalyzed && jobSummary && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #673AB7', borderRadius: '8px', backgroundColor: '#EDE7F6' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#512DA8' }}>
                        📊 Analyzed {totalJobsAnalyzed} Job{totalJobsAnalyzed > 1 ? 's' : ''}
                        {similarJobs === false && ' (⚠️ Different Career Paths)'}
                    </h3>
                    <p style={{ margin: 0, color: '#4527A0' }}>{jobSummary}</p>
                </div>
            )}

            {/* NEW: Technology frequency breakdown */}
            {technologyFrequency && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #00BCD4', borderRadius: '8px', backgroundColor: '#E0F7FA' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#00838F' }}>🔍 Technology Frequency Analysis</h3>
                    {technologyFrequency.critical && technologyFrequency.critical.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#D32F2F', fontWeight: 'bold' }}>
                                🔥 CRITICAL (All {totalJobsAnalyzed} jobs): {technologyFrequency.critical.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.high && technologyFrequency.high.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#F57C00', fontWeight: 'bold' }}>
                                ⭐ HIGH (50%+ jobs): {technologyFrequency.high.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.medium && technologyFrequency.medium.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <p style={{ margin: '5px 0', color: '#1976D2' }}>
                                📌 MEDIUM (2+ jobs): {technologyFrequency.medium.join(', ')}
                            </p>
                        </div>
                    )}
                    {technologyFrequency.low && technologyFrequency.low.length > 0 && (
                        <div>
                            <p style={{ margin: '5px 0', color: '#616161' }}>
                                💡 LOW (1 job): {technologyFrequency.low.join(', ')}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* DEBUG: Show what Gemini read from the URL */}
            {jobPostingPreview && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #9C27B0', borderRadius: '8px', backgroundColor: '#f3e5f5' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7B1FA2' }}>🔍 What Gemini Read from URL:</h3>
                    <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: '#4A148C' }}>{jobPostingPreview}</p>
                </div>
            )}

            {/* Show extracted job requirements */}
            {jobRequirements && jobRequirements.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px', backgroundColor: '#f1f8f4' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>📋 Job Requirements (Technologies Needed):</h3>
                    <p style={{ margin: 0, color: '#1b5e20' }}><strong>{jobRequirements.join(', ')}</strong></p>
                </div>
            )}

            {/* Show user's current skills */}
            {currentSkills && currentSkills.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #2196F3', borderRadius: '8px', backgroundColor: '#e3f2fd' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>✅ Your Current Skills:</h3>
                    <p style={{ margin: 0, color: '#0d47a1' }}>{currentSkills.join(', ')}</p>
                </div>
            )}

            {/* Show missing skills (gaps) */}
            {missingSkills && missingSkills.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #FF9800', borderRadius: '8px', backgroundColor: '#fff3e0' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>🎯 Skills You Need to Learn:</h3>
                    <p style={{ margin: 0, color: '#e65100' }}><strong>{missingSkills.join(', ')}</strong></p>
                </div>
            )}
                </div>
            </div>

            {/* LEARNING MODULES */}
            <div>
                <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Learning Modules</h2>

            {/* Loop through each module */}
            {(() => {
                let globalWeekCounter = 0; // Track continuous week numbers across all modules

                return moduleArray.map((module: any, index: number) => {
                    // Priority badge colors
                    const priorityColors: any = {
                        critical: { bg: '#FFEBEE', border: '#D32F2F', text: '#D32F2F', label: '🔥 CRITICAL' },
                        high: { bg: '#FFF3E0', border: '#F57C00', text: '#F57C00', label: '⭐ HIGH' },
                        medium: { bg: '#E3F2FD', border: '#1976D2', text: '#1976D2', label: '📌 MEDIUM' },
                        low: { bg: '#F5F5F5', border: '#616161', text: '#616161', label: '💡 LOW' }
                    };
                    const priorityStyle = module.priority ? priorityColors[module.priority] : null;

                return (
                    <div key={index} style={{
                        marginBottom: '20px',
                        padding: '15px',
                        border: priorityStyle ? `2px solid ${priorityStyle.border}` : '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: priorityStyle ? priorityStyle.bg : 'white',
                        color: '#333'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, color: '#222' }}>{module.title}</h3>
                            {priorityStyle && (
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: 'white',
                                    border: `1px solid ${priorityStyle.border}`,
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: priorityStyle.text
                                }}>
                                    {priorityStyle.label}
                                </span>
                            )}
                        </div>
                        <p style={{ color: '#444' }}><strong>Duration:</strong> {module.duration}</p>
                        <p style={{ color: '#444' }}>{module.description}</p>

                    <div>
                        <p style={{ color: '#444' }}><strong>Skills:</strong></p>
                        {module.skills.map((skill: string, skillIndex: number) => (
                            <span key={skillIndex} style={{ marginRight: '10px', padding: '4px 8px', backgroundColor: '#e0e0e0', borderRadius: '4px', color: '#333' }}>
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
                );
            });
            })()}
            </div>
        </div>
    );
}
