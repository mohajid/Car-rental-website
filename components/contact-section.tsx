export default function ContactSection() {
  return (
    <section id="contact-us" className="mx-auto max-w-7xl px-6 pb-20">
      <div className="overflow-hidden rounded-3xl bg-white text-neutral-950 shadow-2xl">
        <div className="grid gap-8 bg-gradient-to-br from-blue-950 via-slate-900 to-neutral-950 p-8 text-white md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Contact Us
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Tell us what you need and we will connect with you.
            </h2>
          </div>

          <div className="self-end space-y-3 text-lg text-blue-50">
            <p>
              Email:{" "}
              <a
                href="mailto:quickandeasy@gmail.com"
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                quickandeasy@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:+971566614885"
                className="font-semibold text-white underline-offset-4 hover:underline"
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
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Name
              <input
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-normal text-neutral-950 outline-none transition focus:border-blue-700 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Phone number
              <input
                name="phone"
                type="tel"
                required
                placeholder="+971"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-normal text-neutral-950 outline-none transition focus:border-blue-700 focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Gmail
              <input
                name="gmail"
                type="email"
                required
                placeholder="yourname@gmail.com"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-normal text-neutral-950 outline-none transition focus:border-blue-700 focus:bg-white"
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-blue-800 px-7 py-3 font-bold text-white transition hover:bg-blue-900 md:w-fit"
            >
              Send enquiry
            </button>
          </form>

          <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
              Quick & Easy Car Rental
            </p>
            <h3 className="mt-3 text-2xl font-bold">We will follow up soon</h3>
            <p className="mt-4 leading-7 text-gray-700">
              Share your contact details and our team will reach out with rental
              availability, booking support, and any document guidance you need.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
