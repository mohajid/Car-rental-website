import { cars } from "@/data/cars";
import CarCard from "@/components/carcard";

export default function FleetPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold">Our Fleet</h1>
      <p className="text-gray-500 mt-2">
        Explore available demo vehicles.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </main>
  );
}