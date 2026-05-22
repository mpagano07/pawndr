'use client'

import { useState } from 'react'
import type { LostFoundPet } from '@/types'
import { respondToLostFound, updateLostFoundStatus } from '@/app/lost-found/actions'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Phone, Mail, MessageCircle, Heart, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface LostFoundDetailClientProps {
  pet: LostFoundPet
  currentUserId: string
}

export function LostFoundDetailClient({ pet, currentUserId }: LostFoundDetailClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRespondingLoading, setIsRespondingLoading] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [responseLocationDetails, setResponseLocationDetails] = useState('')

  const isOwner = pet.reporter_id === currentUserId
  const mainImage = pet.images?.[0]?.image_url

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = async (status: 'found' | 'resolved') => {
    if (!isOwner) return

    setIsLoading(true)
    try {
      const { error } = await updateLostFoundStatus(pet.id, status)

      if (error) {
        toast.error(error)
        return
      }

      toast.success(`Estado actualizado a "${status === 'found' ? 'Encontrado' : 'Resuelto'}"`)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error actualizando el estado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!responseMessage.trim()) {
      toast.error('Escribe un mensaje')
      return
    }

    setIsRespondingLoading(true)
    try {
      const { error } = await respondToLostFound(
        pet.id,
        responseMessage,
        responseLocationDetails || undefined
      )

      if (error) {
        toast.error(error)
        return
      }

      toast.success('¡Respuesta enviada!')
      setResponseMessage('')
      setResponseLocationDetails('')
      setShowResponseForm(false)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando la respuesta')
    } finally {
      setIsRespondingLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Main image */}
      <div className="relative aspect-square bg-black/40 rounded-2xl overflow-hidden mx-4 mt-4 mb-6">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={pet.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
            <span className="text-white/40">Sin foto</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            pet.type === 'lost'
              ? 'bg-red-500/90 text-white'
              : 'bg-green-500/90 text-white'
          }`}>
            {pet.type === 'lost' ? '🔴 Perdido' : '🟢 Encontrado'}
          </div>

          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            pet.status === 'active'
              ? 'bg-blue-500/90 text-white'
              : pet.status === 'found'
              ? 'bg-green-500/90 text-white'
              : 'bg-gray-500/90 text-white'
          }`}>
            {pet.status === 'active' ? 'Activo' : pet.status === 'found' ? 'Encontrado' : 'Resuelto'}
          </div>
        </div>
      </div>

      {/* Galería de fotos */}
      {pet.images && pet.images.length > 1 && (
        <div className="px-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            {pet.images.map((img, idx) => (
              <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                <Image
                  src={img.image_url}
                  alt={`${pet.name} ${idx + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 space-y-6">
        {/* Nombre y datos básicos */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{pet.name}</h1>
          <div className="space-y-1 text-white/70">
            {pet.species && (
              <p>
                <span className="font-medium capitalize">{pet.species}</span>
                {pet.breed && ` · ${pet.breed}`}
                {pet.color && ` · ${pet.color}`}
              </p>
            )}
            {pet.gender && <p>Género: {pet.gender === 'male' ? 'Macho' : pet.gender === 'female' ? 'Hembra' : 'Desconocido'}</p>}
            {pet.age_description && <p>Edad aproximada: {pet.age_description}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <h3 className="font-semibold text-white mb-2">Descripción</h3>
          <p className="text-white/70 leading-relaxed">{pet.description}</p>
        </div>

        {/* Características distintivas */}
        {pet.distinguishing_features && (
          <div>
            <h3 className="font-semibold text-white mb-2">Características distintivas</h3>
            <p className="text-white/70">{pet.distinguishing_features}</p>
          </div>
        )}

        {/* Ubicación y fecha */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3 text-white/70">
            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-white">Ubicación del avistamiento</p>
              <p>{pet.last_seen_location}</p>
              {pet.city && <p className="text-sm text-white/60">{pet.city}</p>}
            </div>
          </div>

          <div className="flex items-start space-x-3 text-white/70">
            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-white">Fecha</p>
              <p>{formatDate(pet.date_lost_or_found)}</p>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/10">
          <h3 className="font-semibold text-white">Contacto</h3>
          {pet.contact_name && (
            <p className="text-white/70">
              <span className="font-medium">Nombre:</span> {pet.contact_name}
            </p>
          )}
          {pet.phone && (
            <a
              href={`tel:${pet.phone}`}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{pet.phone}</span>
            </a>
          )}
          {pet.whatsapp && (
            <a
              href={`https://wa.me/${pet.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: {pet.whatsapp}</span>
            </a>
          )}
          {pet.email && (
            <a
              href={`mailto:${pet.email}`}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{pet.email}</span>
            </a>
          )}
        </div>

        {/* Recompensa */}
        {pet.reward_amount && (
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20 flex items-center space-x-3">
            <Heart className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">Recompensa: ${pet.reward_amount}</p>
              {pet.reward_description && (
                <p className="text-sm text-green-500/70">{pet.reward_description}</p>
              )}
            </div>
          </div>
        )}

        {/* Respuestas */}
        {pet.responses && pet.responses.length > 0 && (
          <div>
            <h3 className="font-semibold text-white mb-4">
              Respuestas ({pet.responses.length})
            </h3>
            <div className="space-y-3">
              {pet.responses.map((response) => (
                <div key={response.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      {response.responder ? (
                        <p className="font-medium text-white">
                          @{response.responder.username}
                        </p>
                      ) : (
                        <p className="font-medium text-white/60">Usuario anónimo</p>
                      )}
                    </div>
                    <span className="text-xs text-white/50">
                      {new Date(response.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{response.message}</p>
                  {response.location_details && (
                    <div className="text-xs text-white/60 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{response.location_details}</span>
                    </div>
                  )}
                  {isOwner && (
                    <div className="mt-3 text-xs text-white/50">
                      Estado: {response.status === 'unreviewed' ? 'No revisado' : 'Contactado'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario de respuesta */}
        {!isOwner && pet.status === 'active' && !showResponseForm && (
          <button
            onClick={() => setShowResponseForm(true)}
            className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Tengo información</span>
          </button>
        )}

        {showResponseForm && !isOwner && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
            <h3 className="font-semibold text-white">Comparte información</h3>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                ¿Qué información tienes? *
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Describe dónde viste a la mascota, características que recuerdes, etc."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">
                Ubicación específica (opcional)
              </label>
              <input
                type="text"
                value={responseLocationDetails}
                onChange={(e) => setResponseLocationDetails(e.target.value)}
                placeholder="Ej: Esquina de Mitre y Corrientes"
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2">
              <LoadingButton
                onClick={handleRespond}
                isLoading={isRespondingLoading}
                className="flex-1 bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Enviar
              </LoadingButton>
              <button
                onClick={() => {
                  setShowResponseForm(false)
                  setResponseMessage('')
                  setResponseLocationDetails('')
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Acciones del dueño */}
        {isOwner && pet.status === 'active' && (
          <div className="space-y-2">
            <button
              onClick={() => handleStatusChange('found')}
              disabled={isLoading}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-500 font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              Marcar como encontrado
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={isLoading}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              Marcar como resuelto
            </button>
          </div>
        )}
      </div>

      <div className="h-12" />
    </div>
  )
}
