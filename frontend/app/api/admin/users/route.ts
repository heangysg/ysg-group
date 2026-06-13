import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: users, error } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, isSuperAdmin } = await request.json()
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('User')
      .insert([{
        name,
        email,
        password,
        isSuperAdmin,
        isActive: true,
        createdAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...updateData } = await request.json()
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
