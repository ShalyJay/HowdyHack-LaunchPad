'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4">
      <div className="flex-1 flex items-center justify-center px-4">
        {/* Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-center text-xl ">
            Job RoadMap Generator
          </h1>

          {/* Subtitle */}
          <p className="text-center text-l">
            Get unemployed with AI learning paths
          </p>
        </div>
      </div>

        {/* Call to Action */}
      <div className="pb-20 flex justify-center">
        <Link href="/resume">
          <button style={{
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #ec4899 0%, #9333ea 50%, #3b82f6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(147, 51, 234, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(147, 51, 234, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(147, 51, 234, 0.2)';
          }}>
            Start Your Journey →
          </button>
        </Link>
      </div>
    </div>
  );
}
