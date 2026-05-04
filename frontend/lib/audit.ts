import { createClient } from "./supabase/client"

export interface AuditLogEntry {
  action: string
  entityType: string
  entityId?: string
  details?: any
}

export async function logActivity(entry: AuditLogEntry) {
  try {
    const supabase = createClient()
    const userEmail = localStorage.getItem("adminEmail") || "unknown"
    
    await supabase.from("audit_logs").insert({
      user_email: userEmail,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      details: entry.details || {},
      ip_address: "client-side",
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
