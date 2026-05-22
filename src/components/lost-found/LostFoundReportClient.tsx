'use client'

import { useState } from 'react'
import { createLostFoundReport, addLostFoundImage } from '@/app/lost-found/actions'
import { getLostFoundUploadUrl } from '@/app/lost-found/s3-actions'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Trash2, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { compressImage } from '@/lib/utils'

interface LostFoundReportClientProps {
  defaultContactName: string
}

interface PhotoItem {
  id: string
  src: string
  file: File
}

export function LostFoundReportClient({ defaultContactName }: LostFoundReportClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<PhotoItem[]>([])

  const [formData, setFormData] = useState({
    type: 'lost' as 'lost' | 'found',
    name: '',
    description: '',
    species: 'dog',
    breed: '',
    color: '',
    gender: '',
    age_description: '',
    distinguishing_features: '',
    last_seen_location: '',
    date_lost_or_found: new Date().toISOString().split('T')[0],
    city: '',
    phone: '',
    whatsapp: '',
    email: '',
    contact_name: defaultContactName,
    reward_amount: '',
    reward_description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const compressedFile = await compressImage(file)
            setImages(prev => [
              ...prev,
              {
                id: Math.random().toString(36).substr(2, 9),
                file: compressedFile,
                src: event.target?.result as string
              }
            ])
          } catch (err) {
            toast.error('Error comprimiendo la imagen')
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter((_, idx) => idx !== images.findIndex(img => img.id === id)))
  }

  const uploadImages = async (petId: string) => {
    const newUploadedImages = []

    for (let i = 0; i < images.length; i++) {
      const photoItem = images[i]
      
      try {
        const s3Res = await getLostFoundUploadUrl(photoItem.file.name, photoItem.file.type)
        
        if (s3Res.error || !s3Res.uploadUrl || !s3Res.publicUrl) {
          throw new Error(s3Res.error || 'Error al obtener URL de S3')
        }

        const uploadRes = await fetch(s3Res.uploadUrl, {
          method: 'PUT',
          body: photoItem.file,
          headers: {
            'Content-Type': photoItem.file.type,
          },
        })

        if (!uploadRes.ok) {
          throw new Error('Error al subir una de las imágenes a S3')
        }

        const imageUrl = s3Res.publicUrl
        newUploadedImages.push(imageUrl)

        await addLostFoundImage(petId, imageUrl, i)
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Error subiendo imagen')
      }
    }

    return newUploadedImages
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name.trim()) {
        toast.error('Ingresa el nombre de la mascota')
        return
      }

      if (!formData.description.trim()) {
        toast.error('Ingresa una descripción')
        return
      }

      if (!formData.last_seen_location.trim()) {
        toast.error('Ingresa la ubicación del avistamiento')
        return
      }

      if (images.length === 0) {
        toast.error('Sube al menos una foto')
        return
      }

      // Crear el reporte
      const { error, petId } = await createLostFoundReport({
        type: formData.type,
        name: formData.name,
        description: formData.description,
        species: formData.species,
        breed: formData.breed || undefined,
        color: formData.color || undefined,
        gender: formData.gender || undefined,
        age_description: formData.age_description || undefined,
        distinguishing_features: formData.distinguishing_features || undefined,
        last_seen_location: formData.last_seen_location,
        date_lost_or_found: formData.date_lost_or_found,
        city: formData.city,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email || undefined,
        contact_name: formData.contact_name || undefined,
        reward_amount: formData.reward_amount ? parseInt(formData.reward_amount) : undefined,
        reward_description: formData.reward_description || undefined,
      })

      if (error) {
        toast.error(error)
        return
      }

      if (!petId) {
        toast.error('Error creando el reporte')
        return
      }

      // Subir imágenes
      await uploadImages(petId)

      toast.success('¡Reporte creado exitosamente!')
      router.push('/lost-found')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error creando el reporte')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de reporte */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Tipo de reporte</label>
        <div className="grid grid-cols-2 gap-3">
          {['lost', 'found'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: type as 'lost' | 'found' }))}
              className={`py-3 px-4 rounded-lg font-semibold transition-all border ${
                formData.type === type
                  ? type === 'lost'
                    ? 'bg-red-500/20 border-red-500 text-red-500'
                    : 'bg-green-500/20 border-green-500 text-green-500'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {type === 'lost' ? '🔴 Perdido' : '🟢 Encontrado'}
            </button>
          ))}
        </div>
      </div>

      {/* Fotos */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">Fotos de la mascota *</label>
        
        <div className="space-y-3">
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={img.src}
                    alt={`Preview ${idx}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
            <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
            <span className="text-sm text-white/60">
              {images.length > 0 ? 'Agrega más fotos' : 'Selecciona fotos'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <p className="text-xs text-white/40">{images.length} foto(s) seleccionada(s)</p>
          )}
        </div>
      </div>

      {/* Información básica */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Nombre *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Firulais"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Especie</label>
            <div className="relative">
              <select
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="dog">Perro</option>
                <option value="cat">Gato</option>
                <option value="rabbit">Conejo</option>
                <option value="bird">Pájaro</option>
                <option value="other">Otro</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Raza</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="Ej: Pastor Alemán"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="Ej: Negro y blanco"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Género</label>
            <div className="relative">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">No especificado</option>
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
                <option value="unknown">Desconocido</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Edad aproximada</label>
          <input
            type="text"
            name="age_description"
            value={formData.age_description}
            onChange={handleInputChange}
            placeholder="Ej: 2-3 años, joven, adulto, mayor"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Descripción *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe a la mascota con detalles. Ej: Perro pequeño, pelaje corto, collar rojo..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Características distintivas</label>
          <textarea
            name="distinguishing_features"
            value={formData.distinguishing_features}
            onChange={handleInputChange}
            placeholder="Cicatrices, manchas, microchip, collar, etc."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* Ubicación y fecha */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Última ubicación vista *</label>
          <input
            type="text"
            name="last_seen_location"
            value={formData.last_seen_location}
            onChange={handleInputChange}
            placeholder="Dirección o zona donde se vio por última vez"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Ciudad</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Ej: CABA"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Fecha</label>
            <input
              type="date"
              name="date_lost_or_found"
              value={formData.date_lost_or_found}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Información de contacto</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Nombre de contacto</label>
          <input
            type="text"
            name="contact_name"
            value={formData.contact_name}
            onChange={handleInputChange}
            placeholder="Tu nombre"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ej: 1123456789"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">WhatsApp</label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              placeholder="Ej: 1123456789"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Recompensa */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Recompensa (opcional)</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Monto ($)</label>
            <input
              type="number"
              name="reward_amount"
              value={formData.reward_amount}
              onChange={handleInputChange}
              placeholder="Ej: 5000"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Descripción</label>
            <input
              type="text"
              name="reward_description"
              value={formData.reward_description}
              onChange={handleInputChange}
              placeholder="Ej: Efectivo"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-4 rounded-lg transition-all"
        >
          Publicar reporte
        </LoadingButton>
      </div>
    </form>
  )
}
