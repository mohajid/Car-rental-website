import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about-us", label: "About Us" },
  { href: "/fleet", label: "Fleet" },
  { href: "/#procedures", label: "Requirements" },
  { href: "/#contact-us", label: "Contact" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-graphite bg-obsidian/70 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-lg font-normal tracking-tight text-chalk">
          QUICK AND EASY
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-normal uppercase tracking-wide text-smoke">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/chat"
          className="rounded-full bg-chalk px-5 py-2 text-sm font-normal uppercase tracking-wide text-obsidian transition hover:bg-white"
        >
          AI Chat
        </Link>
      </div>
    </nav>
  );
}

