import { cars } from "@/data/cars";
import CarCard from "./carcard";

export default function FeaturedCars() {
  const featuredCars = cars.filter((car) => car.available).slice(0, 6);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 border-t border-graphite">
      <p className="text-sm font-normal uppercase tracking-[0.2em] text-gold text-center">
        Fleet
      </p>
      <h2 className="mt-4 text-center text-3xl font-normal tracking-tight text-chalk">Featured Cars</h2>
      <p className="mt-2 text-center text-smoke">
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

