import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-bold mb-8">Southia Lore</h1>
      <p className="text-lg text-gray-600 mb-8">
        Explore the rich lore of the Southia world, generated from Azgaar fantasy maps.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/burgs/1" className="text-blue-600 hover:text-blue-800 underline">
              View Burg 1 (Slalzan)
            </Link>
          </li>
          <li>
            <Link href="http://localhost:3002" className="text-blue-600 hover:text-blue-800 underline">
              LoreGen Dashboard (Express Server)
            </Link>
          </li>
        </ul>
      </div>
    </main>
  )
}
