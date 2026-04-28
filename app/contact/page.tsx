"use client"

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("ContactMessage").insert([formData])
    if (error) toast.error("Failed to send message")
    else toast.success("Message sent successfully!")
    setLoading(false)
  }

  return (
    <main className="pb-20 px-4">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold py-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Name" required className="w-full p-3 border rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input type="tel" placeholder="Phone" className="w-full p-3 border rounded-xl" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <textarea placeholder="Message" rows={5} required className="w-full p-3 border rounded-xl" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
        <button type="submit" disabled={loading} className="w-full bg-[#003485] text-white py-3 rounded-xl font-semibold">{loading ? "Sending..." : "Send Message"}</button>
      </form>
    </main>
  )
}
