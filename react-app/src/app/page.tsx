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
          <button className="px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/40 hover:scale-100
            transition-all backdrop-blur-sm border border-white/30 cursor-pointer">
            Start Your Journey →
          </button>
        </Link>
      </div>
    </div>
  );
}
