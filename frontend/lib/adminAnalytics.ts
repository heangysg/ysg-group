export type StatsRange = "7d" | "30d" | "90d" | "12m" | "all";

export const RANGE_OPTIONS: { value: StatsRange; labelEn: string; labelKh: string }[] = [
  { value: "7d", labelEn: "7D", labelKh: "៧ថ្ងៃ" },
  { value: "30d", labelEn: "30D", labelKh: "៣០ថ្ងៃ" },
  { value: "90d", labelEn: "90D", labelKh: "៩០ថ្ងៃ" },
  { value: "12m", labelEn: "12M", labelKh: "១២ខែ" },
  { value: "all", labelEn: "All", labelKh: "ទាំងអស់" },
];

export const ORDER_STATUS_COLORS: Record<string, string> = {
  paid: "#10b981",
  completed: "#059669",
  confirmed: "#3b82f6",
  shipping: "#6366f1",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  failed: "#dc2626",
};

export function formatUsd(amount: number, decimals = 2): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(num) ? num : 0);
}

export function getOrderStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "cancelled":
    case "failed":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-blue-50 text-blue-700 border border-blue-200";
  }
}

export function getOrderStatusLabel(status: string, isKh: boolean, t: (key: any) => string): string {
  switch (status?.toLowerCase()) {
    case "pending":
      return isKh ? "មិនទាន់បង់ (Pending)" : t("pending") || "Pending";
    case "paid":
      return isKh ? "បានបង់ប្រាក់" : "Paid";
    case "confirmed":
      return t("confirmed") || "Confirmed";
    case "shipping":
      return t("shipping") || "Shipping";
    case "completed":
      return t("completed") || "Completed";
    case "cancelled":
      return t("cancelled") || "Cancelled";
    case "failed":
      return isKh ? "បរាជ័យ" : "Failed";
    default:
      return status || "-";
  }
}

export function translateMonthLabel(label: string, isKh: boolean): string {
  if (!isKh || !label) return label;
  const months: Record<string, string> = {
    Jan: "មករា",
    Feb: "កុម្ភៈ",
    Mar: "មីនា",
    Apr: "មេសា",
    May: "ឧសភា",
    Jun: "មិថុនា",
    Jul: "កក្កដា",
    Aug: "សីហា",
    Sep: "កញ្ញា",
    Oct: "តុលា",
    Nov: "វិច្ឆិកា",
    Dec: "ធ្នូ",
  };
  const parts = label.split(" ");
  if (parts.length >= 2) {
    return `${months[parts[0]] || parts[0]} ${parts[1]}`;
  }
  return months[label] || label;
}

export function getAdminHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("ysg_admin_token") : "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  };
}

