import Image from "next/image";
import Link from "next/link";

const residentDocuments = [
  {
    title: "Emirates ID",
    note: "Front and back copy for identity verification.",
    image: "/procedure images/EID WRC (Prod).jpeg",
    alt: "Emirates ID sample",
    imageClassName: "max-w-[300px]",
  },
  {
    title: "UAE Driving License",
    note: "Valid license matching the renter name.",
    image: "/procedure images/License WRC (pro) copy.png",
    alt: "UAE driving license sample",
    imageClassName: "max-w-[300px]",
  },
  {
    title: "Passport Copy",
    note: "Photo page for customer records.",
    image: "/procedure images/Passport WRC (pro).avif",
    alt: "Passport sample",
    imageClassName: "max-w-[230px]",
  },
  {
    title: "Residency / Visa",
    note: "Required when the rental is registered under UAE residency.",
    image: "/procedure images/Residency WRC (Pro) copy.png",
    alt: "Residency visa sample",
    imageClassName: "max-w-[230px]",
  },
];

const uploadTips = [
  "Upload clear PDF, JPG, PNG, or AVIF copies.",
  "Make sure names, expiry dates, and document numbers are readable.",
  "Use the same renter name across ID, license, and passport documents.",
  "Do not upload card details in chat. Payment is handled through secure checkout.",
];

export default function ProcedureSection({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <section
      id={compact ? undefined : "procedures"}
      className={`mx-auto max-w-7xl px-6 ${compact ? "py-16" : "pb-16"}`}
    >
      <div className="overflow-hidden rounded-3xl bg-white text-neutral-950 shadow-2xl">
        <div className="grid gap-8 bg-gradient-to-br from-blue-950 to-blue-700 p-8 text-white md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Procedure
            </p>
            <h2 className="mt-4 max-w-4xl text-3xl font-bold md:text-5xl">
              Upload the right documents before Quicko confirms your booking.
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-blue-50">
              Choose the document path that matches your status. UAE residents
              upload Emirates ID, UAE license, passport, and residency copy.
              Visitors can use passport plus an international driving permit.
            </p>
          </div>

          <Link
            href="/chat"
            className="self-end rounded-full bg-white px-7 py-3 font-bold text-blue-900 transition hover:bg-blue-100"
          >
            Open Quicko
          </Link>
        </div>

        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">UAE resident documents</h3>
                <p className="mt-2 text-gray-600">
                  Upload all four documents for the fastest verification.
                </p>
              </div>
              <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
                Recommended path
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {residentDocuments.map((document) => (
                <article
                  key={document.title}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="min-h-[170px] rounded-xl bg-white p-4">
                    <Image
                      src={document.image}
                      alt={document.alt}
                      width={420}
                      height={260}
                      className={`mx-auto h-[150px] w-full object-contain ${document.imageClassName}`}
                    />
                  </div>
                  <h4 className="mt-5 text-xl font-bold">{document.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {document.note}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                Visitor option
              </p>
              <h3 className="mt-3 text-2xl font-bold">
                Passport + international driving permit
              </h3>
              <div className="mt-6 rounded-xl bg-white p-5">
                <Image
                  src="/procedure images/IDP WRC (Pro).png"
                  alt="International driving permit sample"
                  width={320}
                  height={380}
                  className="mx-auto h-[220px] w-full max-w-[190px] rotate-3 object-contain"
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                If you are visiting the UAE, upload your passport and valid
                international driving permit. Quicko will ask for any extra
                approval if your rental needs it.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold">Upload checklist</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                {uploadTips.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-700" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
