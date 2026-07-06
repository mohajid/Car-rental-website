export default function ContactSection() {
  return (
    <section id="contact-us" className="mx-auto max-w-[1200px] border-t border-graphite px-6 py-16">
      <div className="overflow-hidden rounded-lg border border-graphite text-chalk">
        <div className="grid gap-8 border-b border-graphite bg-carbon p-8 text-chalk md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="text-sm font-normal uppercase tracking-[0.2em] text-gold">
              Contact Us
            </p>
            <h2 className="mt-4 text-3xl font-normal tracking-tight md:text-5xl md:tracking-[-0.02em]">
              Tell us what you need and we will connect with you.
            </h2>
          </div>

          <div className="self-end space-y-3 text-lg text-smoke">
            <p>
              Email:{" "}
              <a
                href="mailto:quickandeasy@gmail.com"
                className="font-normal text-chalk underline-offset-4 hover:underline"
              >
                quickandeasy@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+971566614885"
                className="font-normal text-chalk underline-offset-4 hover:underline"
              >
                +971 566614885
              </a>
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[1fr_0.8fr] md:p-10">
          <form
            action="mailto:quickandeasy@gmail.com"
            method="post"
            encType="text/plain"
            className="grid gap-5"
          >
            <label className="grid gap-2 text-sm font-normal uppercase tracking-wide text-smoke">
              Name
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="rounded border border-graphite bg-obsidian px-4 py-3 text-base font-normal normal-case tracking-normal text-chalk outline-none transition focus:border-gold"
              />
            </label>

            <label className="grid gap-2 text-sm font-normal uppercase tracking-wide text-smoke">
              Phone number
              <input
                name="phone"
                type="tel"
                required
                placeholder="+971"
                className="rounded border border-graphite bg-obsidian px-4 py-3 text-base font-normal normal-case tracking-normal text-chalk outline-none transition focus:border-gold"
              />
            </label>

            <label className="grid gap-2 text-sm font-normal uppercase tracking-wide text-smoke">
              Gmail
              <input
                name="gmail"
                type="email"
                required
                placeholder="yourname@gmail.com"
                className="rounded border border-graphite bg-obsidian px-4 py-3 text-base font-normal normal-case tracking-normal text-chalk outline-none transition focus:border-gold"
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-chalk px-7 py-3 text-sm font-normal uppercase tracking-wide text-obsidian transition hover:bg-white md:w-fit"
            >
              Send enquiry
            </button>
          </form>

          <aside className="rounded-lg border border-graphite p-6">
            <p className="text-sm font-normal uppercase tracking-[0.16em] text-gold">
              Quick & Easy Car Rental
            </p>
            <h3 className="mt-3 text-2xl font-normal text-chalk">We will follow up soon</h3>
            <p className="mt-4 leading-7 text-smoke">
              Share your contact details and our team will reach out with rental
              availability, booking support, and any document guidance you need.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

