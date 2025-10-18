import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Title */}
      <h1 className="text-center text-xl">
        Job RoadMap Generator
      </h1>

      {/* Subtitle */}
      <p className="text-center text-l">
        Get unemployed with AI learning paths
      </p>

      {/* Call to Action */}
      <Link href="/form">
        <button>
          Start Your Journey →
        </button>
      </Link>
    </div>
  );
}
