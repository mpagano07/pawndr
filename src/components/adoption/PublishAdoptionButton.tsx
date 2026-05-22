'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, X, Loader2, PawPrint, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { publishAdoptionPet } from '@/app/adopt/actions'
import { getPresignedUploadUrl } from '@/app/profiles/s3-actions'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { compressImage } from '@/lib/utils'

type HousingType = 'apartment' | 'house' | 'farm' | 'other'

export function PublishAdoptionButton() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5)
    if (selected.length === 0) return

    const toastId = toast.loading('Comprimiendo imágenes...')
    try {
      const compressed = await Promise.all(selected.map(f => compressImage(f)))
      setFiles(compressed)
      setPreviews(compressed.map(f => URL.createObjectURL(f)))
      toast.success('Imágenes listas', { id: toastId })
    } catch (err) {
      toast.error('Error al procesar las imágenes', { id: toastId })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const s3Urls: string[] = []
        
        if (files.length > 0) {
          const toastId = toast.loading('Subiendo fotos...')
          
          for (const file of files) {
            const s3Res = await getPresignedUploadUrl(file.name, file.type)
            if (s3Res.error || !s3Res.uploadUrl || !s3Res.publicUrl) {
              throw new Error(s3Res.error || 'Error al obtener URL de S3')
            }

            const uploadRes = await fetch(s3Res.uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            })

            if (!uploadRes.ok) {
              throw new Error('Error al subir una de las imágenes a S3')
            }

            s3Urls.push(s3Res.publicUrl)
          }
          
          toast.success('Fotos subidas con éxito', { id: toastId })
        }

        fd.append('photos', JSON.stringify(s3Urls))

        const result = await publishAdoptionPet(fd)
        if (result && result.success) {
          toast.success('¡Mascota publicada en adopción! 🐾')
          setOpen(false)
          setPreviews([])
          setFiles([])
          router.push(`/adopt/${result.petId}`)
        } else {
          toast.error(result?.error || 'Error al publicar mascota')
        }
      } catch (err: any) {
        toast.error(err.message || 'Error al publicar mascota')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-amber-500/40 text-amber-400 font-semibold flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-all text-sm"
      >
        <Plus className="w-5 h-5" />
        Publicar mascota en adopción
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{maxHeight: 'min(90svh, 90vh)'}}>
            <div className="relative px-6 pt-6 pb-4 border-b border-white/8 flex-shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Publicar en adopción</h2>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Fotos */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-2">
                  Fotos (hasta 5)
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative border-2 border-dashed border-white/15 rounded-2xl p-4 cursor-pointer hover:border-amber-500/40 transition-all"
                >
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                  {previews.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {previews.map((src, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 relative">
                          <Image src={src} alt={`preview ${i}`} fill className="object-cover" />
                        </div>
                      ))}
                      <div className="w-16 h-16 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/30">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4 text-white/30">
                      <Upload className="w-8 h-8" />
                      <span className="text-xs">Subir fotos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row: Nombre + Especie */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Nombre *</label>
                  <input name="name" required placeholder="Max" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Especie *</label>
                  <select name="species" required className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="dog" className="bg-zinc-900">🐕 Perro</option>
                    <option value="cat" className="bg-zinc-900">🐈 Gato</option>
                    <option value="rabbit" className="bg-zinc-900">🐇 Conejo</option>
                    <option value="bird" className="bg-zinc-900">🦜 Ave</option>
                    <option value="other" className="bg-zinc-900">🐾 Otro</option>
                  </select>
                </div>
              </div>

              {/* Raza */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Raza</label>
                <input name="breed" placeholder="Mestizo, Labrador..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>

              {/* Edad + unidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Edad</label>
                  <input name="age" type="number" min={0} placeholder="6" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Unidad</label>
                  <select name="age_unit" className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="months" className="bg-zinc-900">Meses</option>
                    <option value="years" className="bg-zinc-900">Años</option>
                  </select>
                </div>
              </div>

              {/* Tamaño + Género */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Tamaño *</label>
                  <select name="size" required className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="small" className="bg-zinc-900">Pequeño</option>
                    <option value="medium" className="bg-zinc-900">Mediano</option>
                    <option value="large" className="bg-zinc-900">Grande</option>
                    <option value="xlarge" className="bg-zinc-900">Extra grande</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Género *</label>
                  <select name="gender" required className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="male" className="bg-zinc-900">♂ Macho</option>
                    <option value="female" className="bg-zinc-900">♀ Hembra</option>
                  </select>
                </div>
              </div>

              {/* Ciudad */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Ciudad</label>
                <input name="city" placeholder="Buenos Aires" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-1">Historia / Descripción</label>
                <textarea name="description" rows={3} placeholder="Cuéntanos sobre su personalidad y por qué necesita un hogar..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
              </div>

              {/* Checkboxes */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider font-semibold block mb-2">Características</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'vaccinated', label: '✅ Vacunado' },
                    { name: 'neutered', label: '✂️ Castrado' },
                    { name: 'good_with_dogs', label: '🐕 Con perros' },
                    { name: 'good_with_cats', label: '🐈 Con gatos' },
                    { name: 'good_with_kids', label: '👶 Con niños' },
                    { name: 'apartment_friendly', label: '🏢 Apto depto' },
                    { name: 'urgent', label: '🚨 Urgente' },
                  ].map(item => (
                    <label key={item.name} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" name={item.name} value="true" className="accent-amber-500 w-4 h-4" />
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              </div>

              {/* Submit button sticky at the bottom, outside the scroll area */}
              <div className="flex-shrink-0 px-6 pb-5 pt-3 border-t border-white/8 bg-zinc-900">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-amber-500 text-amber-950 font-bold rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-amber-500/20"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <PawPrint className="w-5 h-5" />}
                  Publicar en adopción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
