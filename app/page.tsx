'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type Clinic = {
  id: string
  name: string | null
  specialty: string | null
  city: string | null
  phone: string | null
  email: string | null
  created_at?: string | null
}

function mustGetEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta variable de entorno: ${name}`)
  return v
}

export default function Home() {
  const supabase = useMemo(() => {
    // Se crean en runtime del navegador (NEXT_PUBLIC_*)
    const url = mustGetEnv('NEXT_PUBLIC_SUPABASE_URL')
    const anon = mustGetEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return createClient(url, anon)
  }, [])

  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  async function loadClinics() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id,name,specialty,city,phone,email,created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClinics((data ?? []) as Clinic[])
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Error cargando clínicas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Si falla por env vars, lo veremos en pantalla
    loadClinics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setName('')
    setSpecialty('')
    setCity('')
    setPhone('')
    setEmail('')
  }

  async function createClinic() {
    setSaving(true)
    setErrorMsg(null)
    try {
      if (!name.trim()) {
        throw new Error('El nombre de la clínica es obligatorio.')
      }

      const payload = {
        name: name.trim(),
        specialty: specialty.trim() || null,
        city: city.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
      }

      const { error } = await supabase.from('clinics').insert(payload)
      if (error) throw error

      setOpen(false)
      resetForm()
      await loadClinics()
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Error guardando clínica')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">CRM SBL Andorra 🚀</h1>

      <p className="mt-4 text-lg">
        Bienvenido David. Aquí vamos a gestionar:
      </p>

      <ul className="mt-4 list-disc ml-6 text-lg">
        <li>Clínicas y especialistas</li>
        <li>Visitas comerciales</li>
        <li>Pedidos y margen</li>
        <li>Productos: PRP, MCT, Biotech, Bliss</li>
      </ul>

      <div className="mt-6 flex gap-3 items-center">
        <button
          className="px-4 py-2 bg-black text-white rounded-xl"
          onClick={() => setOpen(true)}
        >
          + Añadir clínica
        </button>

        <button
          className="px-4 py-2 border border-black/20 rounded-xl"
          onClick={() => loadClinics()}
          disabled={loading}
        >
          {loading ? 'Cargando…' : 'Refrescar'}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
          <b>Error:</b> {errorMsg}
          <div className="mt-2 text-xs text-red-700">
            Tip: si el error habla de RLS/policies, hay que habilitar políticas
            para SELECT/INSERT en `clinics`.
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Clínicas</h2>

        {loading ? (
          <p className="mt-3 text-sm text-black/60">Cargando…</p>
        ) : clinics.length === 0 ? (
          <p className="mt-3 text-sm text-black/60">
            No hay clínicas todavía.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {clinics.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">
                      {c.name ?? '(sin nombre)'}
                    </div>
                    <div className="text-sm text-black/60">
                      {[
                        c.specialty || null,
                        c.city || null,
                        c.phone || null,
                        c.email || null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </div>
                  </div>

                  {c.created_at ? (
                    <div className="text-xs text-black/50">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">Nueva clínica</h3>
              <button
                className="text-sm px-3 py-1 rounded-lg border border-black/10"
                onClick={() => !saving && setOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium">Nombre *</span>
                <input
                  className="rounded-xl border border-black/15 px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Clínica X"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Especialidad</span>
                <input
                  className="rounded-xl border border-black/15 px-3 py-2"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ej: Traumatología"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Ciudad</span>
                <input
                  className="rounded-xl border border-black/15 px-3 py-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Andorra la Vella"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Teléfono</span>
                  <input
                    className="rounded-xl border border-black/15 px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+376..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Email</span>
                  <input
                    className="rounded-xl border border-black/15 px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="clinica@..."
                  />
                </label>
              </div>

              <div className="mt-2 flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded-xl border border-black/15"
                  onClick={() => {
                    if (saving) return
                    setOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="px-4 py-2 rounded-xl bg-black text-white"
                  onClick={createClinic}
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>

              <p className="text-xs text-black/50">
                Si al guardar te sale “RLS”/“policy”, hay que permitir INSERT/SELECT en Supabase para anon.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
