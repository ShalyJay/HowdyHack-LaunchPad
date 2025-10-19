/**
 * ClarificationBox Component
 *
 * This component shows clarifying questions to users about vague job requirements.
 * It distinguishes between high priority (must-have) and low priority (nice-to-have) skills,
 * and asks yes/no questions about the low priority items.
 *
 * To use this component:
 * 1. Import it in your form: import ClarificationBox from '../components/ClarificationBox';
 * 2. Add the component in your JSX (see commented example in form/page.tsx)
 * 3. Make sure to handle the state and callbacks properly
 */

interface ClarificationBoxProps {
    highPriority: string[];
    lowPriority: string[];
    questions: string[];
    userAnswers: {[key: string]: boolean};
    onAnswerChange: (answers: {[key: string]: boolean}) => void;
}

export default function ClarificationBox({
    highPriority,
    lowPriority,
    questions,
    userAnswers,
    onAnswerChange
}: ClarificationBoxProps) {
    return (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-yellow-800">
                ℹ️ Let's clarify your experience
            </h3>

            {/* High Priority - Must Haves */}
            {highPriority.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-300 rounded">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                        🔴 High Priority (Must-Haves)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {highPriority.map((tech, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-200 text-red-900 rounded text-xs font-medium">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Low Priority - Nice to Haves (need clarification) */}
            {lowPriority.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                        🔵 Low Priority (Nice-to-Haves - need clarification)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {lowPriority.map((area, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs">
                                {area}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions about low priority items */}
            <div className="space-y-2 pt-2">
                <p className="text-sm font-medium text-yellow-800">
                    Which of these do you already know?
                </p>
                {questions.map((question, index) => {
                    // Extract technology name from "Do you have experience with X?"
                    const tech = question.replace("Do you have experience with ", "").replace("?", "");
                    return (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={userAnswers[tech] || false}
                                onChange={(e) => onAnswerChange({
                                    ...userAnswers,
                                    [tech]: e.target.checked
                                })}
                                className="w-4 h-4 text-yellow-600 cursor-pointer"
                            />
                            <span className="text-sm text-yellow-900">{question}</span>
                        </label>
                    );
                })}
            </div>
            <p className="text-xs text-yellow-600 mt-3">
                ✅ Check the boxes for technologies you already know. We'll include the others in your roadmap along with the high priority skills you're missing.
            </p>
        </div>
    );
}
