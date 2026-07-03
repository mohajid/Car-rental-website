import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden text-white">
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-32">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl">
          Rent a Car in UAE with AI Assistance
        </h1>

        <p className="mt-6 text-lg max-w-2xl">
          Search cars, compare prices, and get instant AI recommendations for
          your rental needs.
        </p>

        <div className="mt-12 flex justify-center">
          <Link
            href="/chat"
            className="rounded-full bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-[0_0_15px_rgba(255,102,0,0.8),0_0_30px_rgba(255,102,0,0.6)] transition-all duration-300 hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(255,102,0,1),0_0_40px_rgba(255,102,0,0.8)] hover:scale-105"
          >
            Chat with Quicko
          </Link>
        </div>
      </div>
    </section>
  );
}
