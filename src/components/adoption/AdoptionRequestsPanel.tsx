'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, X, ChevronDown, ChevronUp, User, Eye, Home, Info, MessageSquare, Calendar, Heart, Phone } from 'lucide-react'
import { updateAdoptionRequestStatus } from '@/app/adopt/actions'
import { toast } from 'sonner'
import Image from 'next/image'

interface Request {
  id: string
  status: string
  requester_id: string
  created_at: string
  experience?: string | null
  housing_type?: string | null
  other_pets?: string | null
  message?: string | null
  phone?: string | null
  requester?: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface AdoptionRequestsPanelProps {
  requests: Request[]
  petName: string
}

const HOUSING_LABELS: Record<string, string> = {
  apartment: '🏢 Departamento',
  house: '🏡 Casa con patio',
  farm: '🌾 Chacra / Campo',
  other: '🏠 Otra',
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pendiente', cls: 'text-amber-400 font-semibold' },
  accepted: { label: 'Aceptada', cls: 'text-emerald-400 font-bold' },
  rejected: { label: 'Rechazada', cls: 'text-red-400 font-medium' },
}

export function AdoptionRequestsPanel({ requests, petName }: AdoptionRequestsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedReq, setSelectedReq] = useState<Request | null>(null)
  const [isPending, startTransition] = useTransition()
  const [localRequests, setLocalRequests] = useState<Request[]>(requests)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const pendingRequests = localRequests.filter(r => r.status === 'pending')

  const handleAction = (requestId: string, action: 'accepted' | 'rejected') => {
    startTransition(async () => {
      const result = await updateAdoptionRequestStatus(requestId, action)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setLocalRequests(prev =>
          prev.map(r => r.id === requestId ? { ...r, status: action } : r)
        )
        if (selectedReq?.id === requestId) {
          setSelectedReq(prev => prev ? { ...prev, status: action } : null)
        }
        toast.success(action === 'accepted' ? '✅ Solicitud aceptada' : 'Solicitud rechazada')
      }
    })
  }

  return (
    <div className="px-4 pb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3.5 px-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm text-white/80 hover:text-white transition-all shadow-lg"
      >
        <span className="font-bold flex items-center gap-2">
          <span>📬</span> {localRequests.length} Solicitud{localRequests.length !== 1 ? 'es' : ''} para {petName}
          {pendingRequests.length > 0 && (
            <span className="bg-amber-500 text-amber-950 text-[11px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
              {pendingRequests.length} Nueva{pendingRequests.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
      </button>

      {expanded && (
        <div className="space-y-3 mt-3">
          {localRequests.map(req => {
            const statusConf = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
            return (
              <div key={req.id} className="flex items-center justify-between gap-3 p-3.5 bg-white/5 hover:bg-white/[0.07] rounded-2xl border border-white/8 shadow-md transition-all">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 relative border border-white/10">
                    {req.requester?.avatar_url ? (
                      <Image src={req.requester.avatar_url} alt={req.requester.username} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">
                      {req.requester?.full_name || req.requester?.username || 'Usuario'}
                    </p>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 truncate mt-0.5">
                      <span>@{req.requester?.username}</span>
                      <span>·</span>
                      <span className={statusConf.cls}>{statusConf.label}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setSelectedReq(req)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all border border-amber-500/30 shadow-sm"
                    title="Ver solicitud de adopción"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>

                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(req.id, 'accepted')}
                        disabled={isPending}
                        className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl border border-emerald-500/30 transition-all disabled:opacity-50"
                        title="Aceptar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={isPending}
                        className="p-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-xl border border-red-500/25 transition-all disabled:opacity-50"
                        title="Rechazar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Detalle de la Solicitud extraído al body vía Portal */}
      {mounted && selectedReq && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setSelectedReq(null)} />
          
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[85vh] flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 relative border border-white/15">
                  {selectedReq.requester?.avatar_url ? (
                    <Image src={selectedReq.requester.avatar_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <User className="w-6 h-6 text-white/30" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">
                    {selectedReq.requester?.full_name || selectedReq.requester?.username}
                  </h3>
                  <p className="text-sm text-white/50">@{selectedReq.requester?.username}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-sm">
              {selectedReq.phone && (
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider mb-1.5">
                    <Phone className="w-4 h-4" /> Teléfono / WhatsApp de contacto
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-emerald-100 font-bold text-base">{selectedReq.phone}</p>
                    <a
                      href={`https://wa.me/${selectedReq.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                      <span>💬</span> Contactar
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-white/5 p-4 rounded-2xl border border-white/8">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">
                  <Home className="w-4 h-4" /> Tipo de vivienda
                </div>
                <p className="text-white font-semibold">
                  {HOHousingLabel(selectedReq.housing_type)}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/8">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">
                  <Info className="w-4 h-4" /> Experiencia con mascotas
                </div>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedReq.experience || 'No especificó experiencia previa.'}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/8">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">
                  <Heart className="w-4 h-4" /> Otras mascotas en el hogar
                </div>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedReq.other_pets || 'No especificó otras mascotas actuales.'}
                </p>
              </div>

              {selectedReq.message && (
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider mb-1.5">
                    <MessageSquare className="w-4 h-4" /> Mensaje para ti
                  </div>
                  <p className="text-amber-100/90 leading-relaxed italic whitespace-pre-wrap">
                    &ldquo;{selectedReq.message}&rdquo;
                  </p>
                </div>
              )}

              <div className="text-xs text-white/40 flex items-center gap-1.5 justify-end pt-2">
                <Calendar className="w-3.5 h-3.5" /> Solicitado el {new Date(selectedReq.created_at).toLocaleDateString()}
              </div>
            </div>

            {selectedReq.status === 'pending' ? (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => { handleAction(selectedReq.id, 'rejected'); setSelectedReq(null); }}
                  disabled={isPending}
                  className="py-3.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <X className="w-4 h-4" /> Rechazar
                </button>
                <button
                  onClick={() => { handleAction(selectedReq.id, 'accepted'); setSelectedReq(null); }}
                  disabled={isPending}
                  className="py-3.5 bg-emerald-500 text-emerald-950 font-black rounded-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-base"
                >
                  <Check className="w-5 h-5 text-emerald-950" /> Aceptar solicitud
                </button>
              </div>
            ) : (
              <div className="py-3.5 text-center bg-white/5 rounded-xl border border-white/10 text-white/60 font-semibold flex items-center justify-center gap-2">
                <span>Estado actual:</span>
                <span className={STATUS_CONFIG[selectedReq.status]?.cls || 'text-white'}>
                  {STATUS_CONFIG[selectedReq.status]?.label || selectedReq.status}
                </span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function HOHousingLabel(type?: string | null) {
  if (!type) return '🏢 Departamento'
  return HOUSING_LABELS[type] || type
}
