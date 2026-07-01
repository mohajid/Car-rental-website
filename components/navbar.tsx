import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          RentAI
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/fleet">Fleet</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <a
          href="#chatbot"
          className="bg-blue-700 text-white px-5 py-2 rounded-full"
        >
          AI Chat
        </a>
      </div>
    </nav>
  );
}