"use client"

export default function TestKhmer() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Khmer Font Test</h1>

      <div className="bg-white rounded-xl p-6 mb-6">
        <h2 className="font-bold text-lg mb-3">Test Khmer Text:</h2>
        <p className="text-xl mb-2">??????! ?????????????????????????????</p>
        <p className="text-lg">Hello! Can you read this Khmer text?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="font-semibold mb-3">Admin Panel Translations:</h3>
          <ul className="space-y-2">
            <li>??????????????? = Dashboard</li>
            <li> = Products</li>
            <li>?????? = Categories</li>
            <li>????????? = Inquiries</li>
            <li>???????? = Settings</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="font-semibold mb-3">Common Words:</h3>
          <ul className="space-y-2">
            <li>???????? = Save</li>
            <li>??? = Delete</li>
            <li>?????? = Edit</li>
            <li>?????? = Add</li>
            <li>??????? = Search</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm">If you see question marks (????) instead of Khmer text, please ensure:</p>
        <ul className="list-disc ml-6 mt-2 text-sm">
          <li>Your browser supports Unicode</li>
          <li>You have Khmer fonts installed on your system</li>
          <li>Clear browser cache (Ctrl+Shift+Delete)</li>
          <li>Try using Chrome or Firefox browser</li>
        </ul>
      </div>
    </div>
  )
}
