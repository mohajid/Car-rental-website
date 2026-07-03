"use client";

import type { Car } from "@/data/cars";
import Image from "next/image";
import { useState } from "react";

function getFallbackCarImage(category: string) {
  if (category === "SUV" || category === "7-seater") {
    return "/cars/creta.svg";
  }

  if (category === "Sedan" || category === "Luxury") {
    return "/cars/sunny.svg";
  }

  return "/cars/yaris.svg";
}

export default function CarCard({ car }: { car: Car }) {
  const [imageFailed, setImageFailed] = useState(false);
  const transmission = car.features.find((feature) =>
    ["Automatic", "Manual"].includes(feature)
  );
  const seats = car.features.find((feature) => feature.includes("Seats"));
  const highlights = car.features.filter(
    (feature) => feature !== transmission && feature !== seats
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="relative">
        <Image
          src={imageFailed ? getFallbackCarImage(car.category) : car.image}
          alt={`${car.year} ${car.model}`}
          width={640}
          height={360}
          className="w-full h-52 object-cover"
          onError={() => setImageFailed(true)}
        />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
            car.available
              ? "bg-emerald-600 text-white"
              : "bg-gray-900 text-white"
          }`}
        >
          {car.available ? "Available" : "Booked"}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-medium">{car.category}</p>
            <h3 className="text-xl font-bold mt-1">{car.model}</h3>
          </div>
          <p className="text-sm font-semibold text-gray-500">{car.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-4">
          <p>{car.brand}</p>
          <p>{transmission ?? "Rental ready"}</p>
          <p>{seats ?? "Seats listed"}</p>
          <p>{car.pricing.weekly} AED/week</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {highlights.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-5">
          <div>
            <p className="font-bold text-lg">AED {car.pricing.daily}/day</p>
            <p className="text-xs text-gray-500">AED {car.pricing.monthly}/month</p>
          </div>
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded-full disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
            disabled={!car.available}
          >
            {car.available ? "Book Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}
