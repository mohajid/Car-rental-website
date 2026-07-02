import { cars } from "@/data/cars";
import CarCard from "./carcard";

export default function FeaturedCars() {
  const featuredCars = cars.filter((car) => car.available).slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="text-center text-3xl font-bold text-white">Featured Cars</h2>
      <p className="mt-2 text-center text-white/80">
        Choose from our most popular rental cars.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {featuredCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}
