import type { Car } from "@/data/cars";
import Image from "next/image";

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border">
      <Image
        src={car.image}
        alt={car.name}
        width={640}
        height={360}
        className="w-full h-48 object-cover"
      />

      <div className="p-5">
        <p className="text-sm text-blue-600 font-medium">{car.category}</p>
        <h3 className="text-xl font-bold mt-1">{car.name}</h3>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
          <p>{car.transmission}</p>
          <p>{car.fuel}</p>
          <p>{car.seats} seats</p>
          <p>{car.location}</p>
        </div>

        <div className="flex justify-between items-center mt-5">
          <p className="font-bold text-lg">AED {car.dailyPrice}/day</p>
          <button className="bg-blue-700 text-white px-4 py-2 rounded-full">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
