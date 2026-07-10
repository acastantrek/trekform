import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const PANEL_APP_URL = Deno.env.get('PANEL_APP_URL') ?? 'https://trekform.vercel.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'No autorizado.' }, 401)

  // Verify the caller's session token belongs to an active admin before doing
  // anything with the service role key.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: callerData, error: callerError } = await callerClient.auth.getUser()
  if (callerError || !callerData.user) return json({ error: 'No autorizado.' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: callerProfile, error: callerProfileError } = await admin
    .from('profiles')
    .select('role, is_active')
    .eq('id', callerData.user.id)
    .maybeSingle()

  if (callerProfileError || !callerProfile || callerProfile.role !== 'admin' || !callerProfile.is_active) {
    return json({ error: 'Solo un administrador puede invitar usuarios.' }, 403)
  }

  let body: { email?: string; firstName?: string | null; lastName?: string | null }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Cuerpo de la solicitud inválido.' }, 400)
  }

  const email = body.email?.trim().toLowerCase()
  if (!email) return json({ error: 'Falta el email.' }, 400)

  const firstName = body.firstName?.trim() || null
  const lastName = body.lastName?.trim() || null

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${PANEL_APP_URL}/panel/set-password`,
    data: { first_name: firstName, last_name: lastName },
  })

  if (inviteError) return json({ error: inviteError.message }, 400)

  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: invited.user.id, role: 'admin', is_active: true, first_name: firstName, last_name: lastName })

  if (profileError) return json({ error: profileError.message }, 400)

  return json({ ok: true, userId: invited.user.id })
})
