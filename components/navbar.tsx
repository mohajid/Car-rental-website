import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="absolute top-0 z-50 w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          QUICK AND EASY
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium text-white">
          <Link href="/">Home</Link>
          <Link href="/fleet">Fleet</Link>
          <Link href="/#procedures">Procedures</Link>
          <Link href="/#about-us">About Us</Link>
          <Link href="/#contact-us">Contact</Link>
        </div>

        <Link
          href="/chat"
          className="rounded-full border border-white/70 bg-white/10 px-5 py-2 text-white backdrop-blur-sm transition hover:bg-white hover:text-blue-900"
        >
          AI Chat
        </Link>
      </div>
    </nav>
  );
}
