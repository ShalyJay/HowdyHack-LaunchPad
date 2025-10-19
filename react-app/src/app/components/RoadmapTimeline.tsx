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
    // Handle both formats: array of modules OR object with job requirements
    const moduleArray = Array.isArray(modules) ? modules : modules?.modules || [];
    const jobRequirements = !Array.isArray(modules) ? modules?.jobRequirements : null;
    const currentSkills = !Array.isArray(modules) ? modules?.currentSkills : null;
    const missingSkills = !Array.isArray(modules) ? modules?.missingSkills : null;
    const jobPostingPreview = !Array.isArray(modules) ? modules?.jobPostingPreview : null;

    // If no modules, don't show anything
    if (!moduleArray || moduleArray.length === 0) {
        return null;
    }

    return (
        <div>
            <h2>Your Learning Roadmap</h2>

            {/* DEBUG: Show what Gemini read from the URL */}
            {jobPostingPreview && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #9C27B0', borderRadius: '8px', backgroundColor: '#f3e5f5' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#7B1FA2' }}>🔍 What Gemini Read from URL:</h3>
                    <p style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>{jobPostingPreview}</p>
                </div>
            )}

            {/* Show extracted job requirements */}
            {jobRequirements && jobRequirements.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '8px', backgroundColor: '#f1f8f4' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>📋 Job Requirements (Technologies Needed):</h3>
                    <p style={{ margin: 0 }}><strong>{jobRequirements.join(', ')}</strong></p>
                </div>
            )}

            {/* Show user's current skills */}
            {currentSkills && currentSkills.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #2196F3', borderRadius: '8px', backgroundColor: '#e3f2fd' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>✅ Your Current Skills:</h3>
                    <p style={{ margin: 0 }}>{currentSkills.join(', ')}</p>
                </div>
            )}

            {/* Show missing skills (gaps) */}
            {missingSkills && missingSkills.length > 0 && (
                <div style={{ marginBottom: '20px', padding: '15px', border: '2px solid #FF9800', borderRadius: '8px', backgroundColor: '#fff3e0' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>🎯 Skills You Need to Learn:</h3>
                    <p style={{ margin: 0 }}><strong>{missingSkills.join(', ')}</strong></p>
                </div>
            )}

            <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>Learning Modules:</h3>

            {/* Loop through each module */}
            {moduleArray.map((module: Module, index: number) => (
                <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>{module.title}</h3>
                    <p><strong>Duration:</strong> {module.duration}</p>
                    <p>{module.description}</p>

                    <div>
                        <p><strong>Skills:</strong></p>
                        {module.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} style={{ marginRight: '10px', padding: '4px 8px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
                                {skill}
                            </span>
                        ))}
                    </div>

                    {module.resources && module.resources.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                            <p><strong>Resources:</strong></p>
                            <ul>
                                {module.resources.map((resource, resourceIndex) => (
                                    <li key={resourceIndex}>{resource}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
