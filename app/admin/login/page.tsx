"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Hardcoded credentials for now
    if (email === "admin@ysgmachinery.com" && password === "admin123") {
      // Set cookie for middleware
      document.cookie = "adminLoggedIn=true; path=/; max-age=86400"
      localStorage.setItem("adminLoggedIn", "true")
      localStorage.setItem("adminEmail", email)
      router.push("/admin/dashboard")
    } else {
      setError("Invalid email or password. Use: admin@ysgmachinery.com / admin123")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#003485] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">??</span>
          </div>
          <h1 className="text-3xl font-bold text-[#003485]">Admin Login</h1>
          <p className="text-gray-600 mt-2">Access YSG Machinery Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ysgmachinery.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003485] text-white py-3 rounded-lg font-semibold hover:bg-[#002664] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faSignInAlt} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-center text-gray-600">
            <strong className="text-[#003485]">Demo Credentials:</strong><br />
            Email: admin@ysgmachinery.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  )
}
