'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function ProgressNavbar() {
    const pathname = usePathname();
    const router = useRouter();

    const steps = [
        { name: 'Home', path: '/' },
        { name: 'Resume', path: '/resume' },
        { name: 'Time Frame', path: '/timeframe' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Roadmap', path: '/roadmap' }
    ];

    const handleStepClick = (path: string, index: number) => {
        // Only allow navigation to completed steps or current step
        if (index <= currentStepIndex) {
            router.push(path);
        }
    };

    // Determine current step index
    const getCurrentStepIndex = () => {
        if (pathname === '/') return 0;
        if (pathname === '/resume') return 1;
        if (pathname === '/timeframe') return 2;
        if (pathname === '/jobs') return 3;
        if (pathname === '/loading-roadmap') return 4;
        if (pathname === '/roadmap') return 4;
        return -1; // Other pages - don't show navbar
    };

    const currentStepIndex = getCurrentStepIndex();

    // Don't show navbar on other pages
    if (currentStepIndex === -1) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '20px 0',
            zIndex: 1000,
            borderBottom: '2px solid rgba(147, 197, 253, 0.2)',
            boxShadow: '0 4px 30px rgba(147, 51, 234, 0.1)'
        }}>
            <div style={{
                maxWidth: '750px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                paddingTop: '8px'
            }}>
                {/* Connection line - centered through circles */}
                <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '10%',
                    right: '10%',
                    height: '2px',
                    backgroundColor: 'rgba(148, 163, 184, 0.3)',
                    zIndex: 0
                }} />

                {/* Progress line - centered through circles */}
                <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '10%',
                    width: `${(currentStepIndex / (steps.length - 1)) * 80}%`,
                    height: '3px',
                    background: 'linear-gradient(90deg, #ec4899 0%, #9333ea 50%, #3b82f6 100%)',
                    boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
                    zIndex: 0,
                    transition: 'width 0.3s ease',
                    borderRadius: '2px'
                }} />

                {/* Step circles */}
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isClickable = index <= currentStepIndex;

                    return (
                        <div
                            key={index}
                            onClick={() => handleStepClick(step.path, index)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 1,
                                flex: 1,
                                cursor: isClickable ? 'pointer' : 'not-allowed',
                                opacity: isClickable ? 1 : 0.5
                            }}
                        >
                            {/* Circle */}
                            <div style={{
                                width: isCurrent ? '18px' : '12px',
                                height: isCurrent ? '18px' : '12px',
                                borderRadius: '50%',
                                background: isCompleted || isCurrent
                                    ? 'linear-gradient(135deg, #ec4899 0%, #9333ea 100%)'
                                    : '#475569',
                                border: isCurrent ? '3px solid #fff' : isCompleted ? '2px solid #ec4899' : 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent
                                    ? '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(147, 51, 234, 0.4)'
                                    : isCompleted ? '0 0 10px rgba(236, 72, 153, 0.3)' : 'none',
                                marginTop: isCurrent ? '-3px' : '0' // Offset larger circle to keep centered
                            }} />

                            {/* Label */}
                            <span style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: isCurrent ? '#f8fafc' : isCompleted ? '#cbd5e1' : '#94a3b8',
                                fontWeight: isCurrent ? '600' : isCompleted ? '500' : 'normal',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                textShadow: isCurrent ? '0 0 10px rgba(236, 72, 153, 0.5)' : 'none'
                            }}>
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
