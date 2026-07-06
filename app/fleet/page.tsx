import { cars } from "@/data/cars";
import CarCard from "@/components/carcard";

export default function FleetPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 pb-16 pt-32">
      <p className="text-sm font-normal uppercase tracking-[0.2em] text-gold">
        Fleet
      </p>
      <h1 className="mt-4 text-4xl font-normal tracking-tight text-chalk md:text-5xl md:tracking-[-0.02em]">Our Fleet</h1>
      <p className="mt-4 max-w-2xl text-lg text-smoke">
        Explore our full rental fleet across sedan, SUV, luxury, electric, sports, economy, and hatchback options.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </main>
  );
}
