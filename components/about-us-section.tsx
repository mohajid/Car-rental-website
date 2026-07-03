const aboutItems = [
  {
    label: "Our Vision",
    text: "The most professional, transparent, and reliable car rental and leasing company in the UAE, recognized for exceeding customer expectations and fostering long-term loyalty.",
  },
  {
    label: "Our Mission",
    text: "To deliver complete customer satisfaction and loyalty through transparent documentation, strict regulatory compliance, and a commitment to industry leadership driven by the latest technology and an enhanced user experience.",
  },
];

export default function AboutUsSection() {
  return (
    <section id="about-us" className="mx-auto max-w-7xl px-6 pb-16">
      <div className="overflow-hidden rounded-3xl bg-white text-neutral-950 shadow-2xl">
        <div className="grid gap-8 bg-gradient-to-br from-neutral-950 via-slate-900 to-blue-950 p-8 text-white md:grid-cols-[0.85fr_1.15fr] md:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              About Us
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Built around trust, clarity, and dependable mobility.
            </h2>
          </div>

          <p className="self-end text-lg leading-8 text-blue-50">
            Quick and Easy brings a transparent, customer-first approach to car
            rental and leasing across the UAE, backed by clear documentation,
            reliable service, and modern technology.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
          {aboutItems.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
            >
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                {item.label}
              </p>
              <p className="mt-4 text-lg leading-8 text-gray-700">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
