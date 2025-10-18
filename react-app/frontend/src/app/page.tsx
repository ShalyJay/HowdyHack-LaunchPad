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
        <Link href="/form">
          <button>
            Start Your Journey →
          </button>
        </Link>
      </div>
    </div>
  );
}
