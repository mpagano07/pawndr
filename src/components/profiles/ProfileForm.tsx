'use client'

import { useState, useRef } from 'react'
import { User, Edit2, Loader2, Camera } from 'lucide-react'
import { updateProfile } from '@/app/profiles/actions'
import { toast } from 'sonner'
import Image from 'next/image'
import { LocationButton } from '@/components/ui/LocationButton'

interface ProfileFormProps {
  profile: any
  dict: any
}

export function ProfileForm({ profile, dict }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    if (avatarFile) {
      formData.set('avatar', avatarFile)
    }

    try {
      const result = await updateProfile(formData)
      if (result && result.success) {
        toast.success('Perfil actualizado exitosamente')
      } else {
        toast.error(result?.error || 'Error al actualizar el perfil')
      }
    } catch (err) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-3xl p-6 mb-8 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />

      <div className="flex items-center gap-5 mb-6">
        <div
          className="relative group cursor-pointer flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          title="Cambiar foto de perfil"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/40 overflow-hidden relative shadow-md transition-transform group-hover:scale-105">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={profile?.full_name || 'Avatar'}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-xl font-bold truncate">{profile?.full_name || dict.profile.setup}</h2>
          <p className="text-primary font-medium text-sm truncate">@{profile?.username}</p>
          <span className="text-xs text-white/40 mt-1 inline-block">Clic en foto para cambiar</span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block"
          >
            {dict.common.username || 'Nombre de usuario'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-white/40 font-bold">@</span>
            <input
              id="username"
              type="text"
              name="username"
              defaultValue={profile?.username || ''}
              placeholder="tu_usuario"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white placeholder:text-white/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="full_name"
            className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block"
          >
            {dict.profile.fullName}
          </label>
          <input
            id="full_name"
            type="text"
            name="full_name"
            defaultValue={profile?.full_name || ''}
            placeholder="Tu nombre completo"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="text-xs text-white/60 uppercase tracking-wider font-semibold mb-1 block"
          >
            {dict.profile.bio}
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio || ''}
            placeholder="Cuéntanos un poco sobre ti..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none h-24 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Edit2 className="w-4 h-4" />
          )}
          <span>{dict.profile.saveProfile}</span>
        </button>
      </form>

      {/* Location button */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2">
          Ubicación
        </p>
        <LocationButton />
      </div>
    </div>
  )
}
