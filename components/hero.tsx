import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden text-chalk">
      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-20 pt-32">
        <p className="text-sm font-normal uppercase tracking-[0.2em] text-smoke">
          Quick and Easy · UAE
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl font-normal leading-[1.05] tracking-tight text-chalk md:text-6xl md:tracking-[-0.02em]">
          Rent a car in the UAE with AI assistance
        </h1>

        <p className="mt-6 max-w-2xl text-lg font-normal text-smoke">
          Search cars, compare prices, and get instant AI recommendations for
          your rental needs.
        </p>

        <div className="mt-12 flex justify-center">
          <Link
            href="/chat"
            className="rounded-full bg-chalk px-8 py-4 text-sm font-normal uppercase tracking-wide text-obsidian transition-transform duration-300 hover:bg-white hover:scale-105"
          >
            Chat with Quicko
          </Link>
        </div>
      </div>
    </section>
  );
}

