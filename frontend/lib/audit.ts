import { createClient } from "./supabase/client"

export interface AuditLogEntry {
  action: string
  entityType: string
  entityId?: string
  details?: any
}

export async function logActivity(entry: AuditLogEntry) {
  try {
    const token = localStorage.getItem("ysg_admin_token");
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    await fetch(`${API_URL}/api/admin/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(entry)
    });
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
