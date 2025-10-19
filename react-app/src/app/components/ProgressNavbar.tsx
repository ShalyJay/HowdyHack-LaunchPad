'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProgressNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    // Hide navbar on home page
    if (pathname === '/') {
        return null;
    }

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
            background: 'var(--bg-secondary)',
            padding: '20px 0',
            zIndex: 1000,
            borderBottom: '1px solid rgba(var(--text-muted), 0.2)',
            animation: 'slideDown 0.5s ease-out'
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
                    backgroundColor: 'rgba(var(--text-muted), 0.3)',
                    zIndex: 0
                }} />

                {/* Progress line - centered through circles */}
                <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '10%',
                    width: `${(currentStepIndex / (steps.length - 1)) * 80}%`,
                    height: '3px',
                    background: 'linear-gradient(90deg, var(--pink-main) 0%, var(--purple-main) 50%, var(--blue-main) 100%)',
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
                                    ? 'linear-gradient(135deg, var(--pink-main) 0%, var(--purple-main) 100%)'
                                    : 'rgba(var(--slate-rgb), 1)',
                                border: isCurrent ? '3px solid var(--white)' : isCompleted ? `2px solid var(--pink-main)` : 'none',
                                transition: 'all 0.3s ease',
                                marginTop: isCurrent ? '-3px' : '0' // Offset larger circle to keep centered
                            }} />

                            {/* Label */}
                            <span style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: isCurrent ? 'var(--text-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                                fontWeight: isCurrent ? '600' : isCompleted ? '500' : 'normal',
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
