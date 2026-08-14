import { useState, useRef } from "react"
import { Upload, X, FileSpreadsheet, Check, AlertTriangle } from "lucide-react"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"
import { useLanguage } from "../contexts/LanguageContext"

interface ExcelImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ExcelImportModal({ onClose, onSuccess }: ExcelImportModalProps) {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        
        if (json.length === 0) {
          setError(language === "kh" ? "ឯកសារ Excel គ្មានទិន្នន័យទេ" : "The Excel file is empty.")
          return
        }

        const formattedData = json.map((row: any) => ({
          name: row["Name (English)"] || row["Name"] || "",
          nameKhmer: row["Name (Khmer)"] || "",
          slug: row["Slug"] || row["Name"]?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "",
          categoryId: row["Category ID"] || "123",
          price: parseFloat(row["Price"]) || 0,
          currency: row["Currency"] || "USD",
          stock: parseInt(row["Stock"]) || 0,
          shortDescription: row["Short Description (English)"] || "",
          shortDescriptionKhmer: row["Short Description (Khmer)"] || "",
          model: row["Model"] || "",
          brand: row["Brand"] || "",
          sku: row["SKU"] || "",
          status: row["Status"] || "ACTIVE",
          isPublished: row["Published"]?.toString().toLowerCase() === "true" || row["Published"] === 1 || true,
          thumbnail: row["Image URL"] || null
        }))

        setParsedData(formattedData)
      } catch (err) {
        setError(language === "kh" ? "មិនអាចអានឯកសារ Excel នេះបានទេ" : "Could not read this Excel file. Make sure it's a valid .xlsx or .csv")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setLoading(true)
    setError("")

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      
      const res = await fetch(`${API_URL}/api/admin/products/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ products: parsedData })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to import")
      }

      toast.success(language === "kh" ? `បានបញ្ចូលផលិតផលចំនួន ${data.count} ដោយជោគជ័យ` : `Successfully imported ${data.count} products`)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        "Name (English)": "Excavator X1",
        "Name (Khmer)": "អេស្កាវ៉ាទ័រ X1",
        "Slug": "excavator-x1",
        "Category ID": "ENTER_CATEGORY_ID_HERE",
        "Price": 50000,
        "Currency": "USD",
        "Stock": 10,
        "Short Description (English)": "Heavy duty excavator",
        "Short Description (Khmer)": "អេស្កាវ៉ាទ័រធន់ធ្ងន់",
        "Model": "X1-Pro",
        "Brand": "YSG",
        "SKU": "YSG-EX-001",
        "Status": "ACTIVE",
        "Published": "true",
        "Image URL": ""
      }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, "ysg_product_import_template.xlsx")
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#004691]" />
            {language === "kh" ? "បញ្ចូលទិន្នន័យផលិតផលតាម Excel" : "Import Products via Excel"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100 flex items-start gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedData.length === 0 ? (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-[#004691] transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="font-bold text-slate-700 text-base mb-1">
                  {language === "kh" ? "ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ .xlsx" : "Click here to upload .xlsx file"}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {language === "kh" ? "គាំទ្រឯកសារ Excel និង CSV" : "Supports Excel and CSV files"}
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="text-sm">
                  <p className="font-bold text-[#004691]">{language === "kh" ? "មិនទាន់មានទម្រង់មែនទេ?" : "Don't have a template?"}</p>
                  <p className="text-slate-600 mt-0.5">{language === "kh" ? "ទាញយកទម្រង់គំរូជា Excel សម្រាប់បញ្ចូលទិន្នន័យ" : "Download the sample Excel template"}</p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-white text-[#004691] font-bold text-xs border border-[#004691]/20 rounded-md hover:bg-[#004691] hover:text-white transition-colors"
                >
                  {language === "kh" ? "ទាញយក" : "Download"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-md text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-emerald-800 font-bold text-lg mb-1">
                  {language === "kh" ? `បានរកឃើញផលិតផលចំនួន ${parsedData.length}` : `Found ${parsedData.length} products`}
                </h4>
                <p className="text-emerald-600 text-sm font-medium">
                  {language === "kh" ? "ទិន្នន័យរួចរាល់សម្រាប់ការបញ្ចូល" : "Data is ready to be imported"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setParsedData([])}
                  disabled={loading}
                  className="flex-1 py-3 text-slate-700 bg-white border border-slate-200 font-bold rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {language === "kh" ? "បោះបង់" : "Cancel"}
                </button>
                <button 
                  onClick={handleImport}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#004691] text-white font-bold rounded-md hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {language === "kh" ? "បញ្ចូលឥឡូវនេះ" : "Import Now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
