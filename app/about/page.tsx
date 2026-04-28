export default function AboutPage() {
  return (
    <main className="pb-20 px-4">
      <h1 className="text-3xl font-bold py-4">About YSG Machinery</h1>
      <div className="bg-gradient-to-r from-[#003485] to-[#002664] text-white p-8 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Trusted Partner Since 2010</h2>
        <p>YSG Machinery provides premium heavy equipment solutions across Southeast Asia and beyond.</p>
      </div>
      <div className="grid gap-4">
        <div className="bg-gray-50 p-6 rounded-2xl"><h3 className="font-bold text-xl mb-2">?? Our Mission</h3><p>To deliver premium heavy equipment solutions that empower businesses.</p></div>
        <div className="bg-gray-50 p-6 rounded-2xl"><h3 className="font-bold text-xl mb-2">??? Our Vision</h3><p>To be the leading heavy equipment partner across Southeast Asia.</p></div>
      </div>
    </main>
  )
}
