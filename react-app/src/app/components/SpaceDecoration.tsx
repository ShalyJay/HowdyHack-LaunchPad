'use client';

import Image from 'next/image';

export default function SpaceDecoration() {
    return (
        <>
            {/* Fixed positioned decorative planets */}
            <div style={{
                position: 'fixed',
                top: '10%',
                right: '5%',
                width: '120px',
                height: '120px',
                opacity: 0.15,
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'float 20s ease-in-out infinite'
            }}>
                <Image
                    src="/images/planets/planet1.png"
                    alt=""
                    width={120}
                    height={120}
                    style={{ objectFit: 'contain' }}
                />
            </div>

            <div style={{
                position: 'fixed',
                bottom: '15%',
                left: '8%',
                width: '80px',
                height: '80px',
                opacity: 0.12,
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'float 25s ease-in-out infinite reverse'
            }}>
                <Image
                    src="/images/planets/planet2.png"
                    alt=""
                    width={80}
                    height={80}
                    style={{ objectFit: 'contain' }}
                />
            </div>

            <div style={{
                position: 'fixed',
                top: '50%',
                left: '3%',
                width: '60px',
                height: '60px',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'float 30s ease-in-out infinite'
            }}>
                <Image
                    src="/images/planets/planet3.png"
                    alt=""
                    width={60}
                    height={60}
                    style={{ objectFit: 'contain' }}
                />
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                }
            `}</style>
        </>
    );
}
