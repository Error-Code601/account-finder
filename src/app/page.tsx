export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-5xl font-bold mb-6">
          Find Every Account Linked To Your Gmail
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          See all websites, apps, and services connected to your email in one
          place.
        </p>
        <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition">
          Scan My Gmail
        </button>
      </div>
    </main>
  );
}
