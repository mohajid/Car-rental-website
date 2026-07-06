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
    <section id="about-us" className="mx-auto max-w-[1200px] px-6 py-16 border-t border-graphite">
      <p className="text-sm font-normal uppercase tracking-[0.2em] text-gold">
        About Us
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-normal tracking-tight text-chalk md:text-5xl md:tracking-[-0.02em]">
        Built around trust, clarity, and dependable mobility.
      </h2>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-smoke">
        Quick and Easy brings a transparent, customer-first approach to car
        rental and leasing across the UAE.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {aboutItems.map((item) => (
          <article
            key={item.label}
            className="rounded-lg border border-graphite p-6"
          >
            <p className="text-sm font-normal uppercase tracking-[0.16em] text-gold">
              {item.label}
            </p>
            <p className="mt-4 text-lg leading-8 text-smoke">
              {item.text}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-8 inline-flex items-center gap-2 rounded border border-graphite px-4 py-2 text-xs font-normal uppercase tracking-wide text-smoke">
        <span className="h-1.5 w-1.5 rounded-full bg-pulse" />
        Since 2014, part of a reputable group of companies
      </p>
    </section>
  );
}
