'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import SpinningSphere with no SSR
const SpinningSphere = dynamic(() => import('./components/SpinningSphere'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6">
          {/* 3D Spinning Sphere */}
          <SpinningSphere />

          {/* Subtitle */}
          <p className="text-center text-xl font-semibold" style={{ marginTop: '-20px', fontFamily: 'var(--font-orbitron)' }}>
            Where careers take off.
          </p>

          {/* Call to Action */}
          <Link href="/resume">
            <button style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, var(--pink-main) 0%, var(--purple-main) 50%, var(--blue-main) 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'var(--font-orbitron)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Start Here →
            </button>
          </Link>
        </div>
      </div>

      <div className="pb-32"></div>
    </div>
  );
}
