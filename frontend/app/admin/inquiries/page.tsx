"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle, Clock, Eye, X, Phone, Send, Copy, ExternalLink, Loader2 } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"
import Portal from "../../../components/Portal"

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    fetchInquiries()
  }, [router])

  async function fetchInquiries() {
    setLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

    const res = await fetch(`${API_URL}/api/admin/read`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        table: "Inquiry",
        order: { column: "createdAt", ascending: false }
      })
    })

    const result = await res.json()

    if (result.error) {
      console.error("Error fetching inquiries:", result.error)
    } else {
      setInquiries(result.data || [])
    }
    setLoading(false)
  }

  function openInquiryModal(inquiry: any) {
    setSelectedInquiry(inquiry)
    setReplyMessage(inquiry.notes || "")
  }

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem("ysg_admin_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ table: "Inquiry", action: "update", match: { id }, data: { status } })
    })
    const result = await res.json().catch(() => ({}))

    if (!res.ok || result.error) {
      toast.error(result.error || t("errorUpdatingStatus"))
    } else {
      toast.success(t("statusUpdated"))
      setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
      setSelectedInquiry((prev: any) => (prev?.id === id ? { ...prev, status } : prev))
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedInquiry) return

    setSubmittingReply(true)
    try {
      const token = localStorage.getItem("ysg_admin_token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const res = await fetch(`${API_URL}/api/admin/inquiries/${selectedInquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ replyMessage, status: "replied" })
      })
      const result = await res.json().catch(() => ({}))

      if (!res.ok || result.error) {
        toast.error(result.error || t("errorUpdatingStatus"))
        return
      }

      const updated = result.inquiry || {
        ...selectedInquiry,
        status: "replied",
        notes: replyMessage.trim() || selectedInquiry.notes
      }

      setInquiries((prev) => prev.map((item) => (item.id === selectedInquiry.id ? updated : item)))
      setSelectedInquiry(updated)

      if (result.emailSent) {
        toast.success(language === "kh" ? "បានផ្ញើអ៊ីមែលឆ្លើយតប និងសម្គាល់ថាបានតប!" : "Reply email sent & marked as replied!")
      } else if (replyMessage.trim() && result.emailReason === "smtp_not_configured") {
        toast.success(
          language === "kh"
            ? "បានរក្សាទុកកំណត់ត្រា និងសម្គាល់ថាបានតប! (ប្រើ Gmail/ទូរស័ព្ទ ដើម្បីផ្ញើទៅអតិថិជន)"
            : "Note saved & marked replied! Use Open in Gmail or Call to reach the customer."
        )
      } else {
        toast.success(t("statusUpdated"))
      }
    } catch (err) {
      console.error("Reply error:", err)
      toast.error(t("errorUpdatingStatus"))
    } finally {
      setSubmittingReply(false)
    }
  }

  function copyText(value: string, label: string) {
    navigator.clipboard?.writeText(value)
    toast.success(`${label}: ${value}`)
  }

  function isReplied(status?: string) {
    const normalized = (status || "").toLowerCase()
    return normalized === "replied" || normalized === "closed"
  }

  function formatSource(source?: string) {
    if (!source) return null
    if (source === "contact-form") return language === "kh" ? "ទំព័រទំនាក់ទំនង" : "Contact Form"
    if (source === "contact-inquiry-tab") return language === "kh" ? "ទំព័រតម្រូវការ" : "Inquiry Tab"
    return source
  }

  function getStatusBadgeClass(status?: string) {
    const normalized = (status || "new").toLowerCase()
    if (normalized === "new") return "bg-amber-50 text-amber-700 border-amber-200"
    if (normalized === "read" || normalized === "contacted" || normalized === "quoted") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  }

  function getGmailUrl(inquiry: any) {
    const subject = encodeURIComponent("Re: Inquiry at YSG Machinery")
    const body = encodeURIComponent(replyMessage ? `${replyMessage}\n\n---\n${inquiry.message || ""}` : "")
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inquiry.email || "")}&su=${subject}&body=${body}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-medium text-xs">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold uppercase text-slate-900">{t("customerInquiries")}</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {language === "kh" ? "គ្រប់គ្រង និងឆ្លើយតបសំណួររបស់អតិថិជន" : "Respond to customer questions and machinery requests"}
          </p>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="solid-card bg-white p-16 text-center rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {language === "kh" ? "មិនទាន់មានសំណួរអតិថិជន" : "No Inquiries Yet"}
          </h3>
          <p className="text-slate-500 mt-2 font-medium text-xs">
            {t("noInquiriesDesc") || "Customer messages will appear here once they contact you."}
          </p>
        </div>
      ) : (
        <div className="solid-card bg-white overflow-hidden p-0 border border-slate-200 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary border-b border-slate-200 text-white">
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {t("customer")}
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {language === "kh" ? "ទំនាក់ទំនង" : "Contact"}
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {language === "kh" ? "សារ" : "Message"}
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {t("date")}
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                    {t("status")}
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap text-right">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry: any) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => openInquiryModal(inquiry)}
                    className="group hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {inquiry.name || inquiry.customerName || t("walkInCustomer")}
                          </span>
                          {inquiry.source && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md">
                              {formatSource(inquiry.source)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <span className="truncate max-w-[160px]">{inquiry.email || "—"}</span>
                        <span className="text-slate-300">•</span>
                        <span>{inquiry.phone || inquiry.customerPhone || t("noPhoneProvided") || "—"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-xs text-slate-700 font-medium truncate">
                        {inquiry.message || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {new Date(inquiry.createdAt).toLocaleDateString(language === "kh" ? "km-KH" : "en-US")}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${getStatusBadgeClass(inquiry.status)}`}
                      >
                        {inquiry.status || "new"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openInquiryModal(inquiry)}
                          title={language === "kh" ? "មើលលម្អិត" : "View"}
                          className="p-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openInquiryModal(inquiry)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {language === "kh" ? "ឆ្លើយតប" : "Reply"}
                        </button>
                        {!isReplied(inquiry.status) && (
                          <button
                            onClick={() => updateStatus(inquiry.id, "replied")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t("markReplied")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedInquiry && (
        <Portal>
          <div
            className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedInquiry(null)}
          >
            <div
              className="solid-card bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 px-5 py-3 bg-primary text-white border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedInquiry.name || selectedInquiry.customerName || t("walkInCustomer")}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium mt-0.5">
                    {formatSource(selectedInquiry.source) || t("customerInquiries")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1.5 bg-white text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedInquiry.email ? (
                      <button
                        type="button"
                        onClick={() => copyText(selectedInquiry.email, "Email")}
                        className="inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                        title="Copy email"
                      >
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedInquiry.email}</span>
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5" /> —
                      </span>
                    )}

                    {(selectedInquiry.phone || selectedInquiry.customerPhone) ? (
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`tel:${selectedInquiry.phone || selectedInquiry.customerPhone}`}
                          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{selectedInquiry.phone || selectedInquiry.customerPhone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => copyText(selectedInquiry.phone || selectedInquiry.customerPhone, "Phone")}
                          className="text-slate-400 hover:text-primary"
                          title="Copy phone"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase ${getStatusBadgeClass(selectedInquiry.status)}`}
                  >
                    {selectedInquiry.status || "new"}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    {language === "kh" ? "សាររបស់អតិថិជន" : "Customer Message"}
                  </p>
                  <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Quick External Contact Channels */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedInquiry.email && (
                    <>
                      <a
                        href={getGmailUrl(selectedInquiry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {language === "kh" ? "បើកតាម Gmail" : "Open in Gmail"}
                      </a>
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: Inquiry at YSG Machinery`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {language === "kh" ? "កម្មវិធីអ៊ីមែល" : "Mail App"}
                      </a>
                    </>
                  )}
                  {(selectedInquiry.phone || selectedInquiry.customerPhone) && (
                    <a
                      href={`tel:${selectedInquiry.phone || selectedInquiry.customerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {language === "kh" ? "ហៅទូរស័ព្ទ" : "Call Phone"}
                    </a>
                  )}
                </div>

                {/* Reply / Note Form */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === "kh" ? "សរសេរការឆ្លើយតប ឬកំណត់ត្រា" : "Reply Message / Internal Note"}
                  </label>
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={
                      language === "kh"
                        ? "សរសេរចម្លើយជូនអតិថិជន (នឹងផ្ញើតាម Email ប្រសិនបើបានភ្ជាប់ SMTP ឬរក្សាទុកជាកំណត់ត្រា)..."
                        : "Write your reply (sends via email if SMTP is configured, and saves as note)..."
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-primary outline-none transition-all resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedInquiry.createdAt).toLocaleString(language === "kh" ? "km-KH" : "en-US")}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isReplied(selectedInquiry.status) && (
                        <button
                          type="button"
                          onClick={() => updateStatus(selectedInquiry.id, "replied")}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("markReplied")}
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submittingReply}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-95 disabled:opacity-60 transition-all"
                      >
                        {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {language === "kh" ? "ផ្ញើ & សម្គាល់ថាបានតប" : "Send / Mark Replied"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <Toaster position="top-right" />
    </div>
  )
}
