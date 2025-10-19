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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            padding: '20px 0',
            zIndex: 1000,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 0
                }} />

                {/* Progress line - centered through circles */}
                <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '10%',
                    width: `${(currentStepIndex / (steps.length - 1)) * 80}%`,
                    height: '2px',
                    backgroundColor: '#4CAF50',
                    zIndex: 0,
                    transition: 'width 0.3s ease'
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
                                width: isCurrent ? '16px' : '12px',
                                height: isCurrent ? '16px' : '12px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted || isCurrent ? '#4CAF50' : '#666',
                                border: isCurrent ? '3px solid #fff' : 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: isCurrent ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
                                marginTop: isCurrent ? '-2px' : '0' // Offset larger circle to keep centered
                            }} />

                            {/* Label */}
                            <span style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                                fontWeight: isCurrent ? 'bold' : 'normal',
                                textAlign: 'center',
                                whiteSpace: 'nowrap'
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
