export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl">
          Rent a Car in UAE with AI Assistance
        </h1>

        <p className="mt-6 text-lg max-w-2xl">
          Search cars, compare prices, and get instant AI recommendations for
          your rental needs.
        </p>

        <div className="bg-white text-black rounded-2xl p-5 mt-10 grid md:grid-cols-4 gap-4">
          <input className="border p-3 rounded-xl" placeholder="Pickup location" />
          <input className="border p-3 rounded-xl" type="date" />
          <select className="border p-3 rounded-xl">
            <option>Daily Rental</option>
            <option>Weekly Rental</option>
            <option>Monthly Rental</option>
          </select>
          <button className="bg-blue-700 text-white rounded-xl">
            Search Cars
          </button>
        </div>
      </div>
    </section>
  );
}