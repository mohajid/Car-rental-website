import { cars } from "@/data/cars";
import CarCard from "./carcard";

export default function FeaturedCars() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center">Featured Cars</h2>
      <p className="text-center text-gray-500 mt-2">
        Choose from our most popular rental cars.
      </p>

      <div className="grid md:grid-cols-3 gap-8 mt-10">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}