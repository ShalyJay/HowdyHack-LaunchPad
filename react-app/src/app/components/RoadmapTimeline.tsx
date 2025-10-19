interface Module {
    title: string;
    duration: string;
    skills: string[];
    description: string;
    resources: string[];
}

interface RoadmapTimelineProps {
    modules: Module[];
}

// recieves array of module objects --> loops through modules to display stuff
export default function RoadmapTimeline({ modules }: RoadmapTimelineProps) 
{
    // If no modules, don't show anything
    if (!modules || modules.length === 0) {
        return null;
    }

    return (
        <div>
            <h2>Your Learning Roadmap</h2>

            {/* Loop through each module */}
            {modules.map((module, index) => (
                <div key={index}>
                    <h3>{module.title}</h3>
                    <p>Duration: {module.duration}</p>
                    <p>{module.description}</p>

                    <div>
                        <p>Skills:</p>
                        {module.skills.map((skill, skillIndex) => (
                            <span key={skillIndex}>{skill} </span>
                        ))}
                    </div>

                    {module.resources && module.resources.length > 0 && (
                        <div>
                            <p>Resources:</p>
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