import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4">
      <div>
        {/* Title */}
        <h1 className="text-center text-xl ">
          Job RoadMap Generator
        </h1>

        {/* Subtitle */}
        <p className="text-center text-l">
          Get unemployed with AI learning paths
        </p>
      </div>

        {/* Call to Action */}
        <Link href="/form">
          <button>
            Start Your Journey →
          </button>
        </Link>
    </div>
  );
}
