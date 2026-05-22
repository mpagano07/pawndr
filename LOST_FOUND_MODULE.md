# 🔴 Módulo de Mascotas Perdidas y Encontradas (Lost & Found)

## Descripción

Un módulo completo que permite a los usuarios reportar mascotas perdidas o encontradas, compartir fotos y detalles para ayudar a recuperar o devolver mascotas.

## Características Implementadas

### 📱 Interfaz de Usuario

1. **Página Principal `/lost-found`**
   - Feed de mascotas perdidas y encontradas
   - Filtros por tipo (perdido/encontrado)
   - Búsqueda y paginación infinita
   - Header con opciones rápidas

2. **Crear Reporte `/lost-found/report`**
   - Formulario completo con validación
   - Subida de múltiples fotos con compresión automática
   - Integración con S3 (presigned URLs)
   - Información de contacto (teléfono, WhatsApp, email)
   - Opción de publicar recompensa

3. **Detalle de Mascota `/lost-found/[id]`**
   - Galería de fotos
   - Información completa del reporte
   - Sistema de respuestas de otros usuarios
   - Acciones para dueños del reporte
   - Contacto directo

4. **Mis Reportes `/lost-found/my-reports`**
   - Vista de todos los reportes propios
   - Eliminación de reportes
   - Estados: Activo / Encontrado / Resuelto

### 🛠️ Backend

#### Base de Datos (Supabase)
```
Tablas:
- lost_found_pets: Mascotas reportadas
- lost_found_pet_images: Imágenes de las mascotas
- lost_found_responses: Respuestas de usuarios con información
```

#### Server Actions
```typescript
// Obtener mascotas
getLostFoundFeed(filters, page, pageSize)
getLostFoundPetById(id)
getMyLostFoundReports()

// Crear y gestionar reportes
createLostFoundReport(formData)
addLostFoundImage(petId, imageUrl, position)
updateLostFoundStatus(petId, status)
deleteLostFoundReport(petId)

// Respuestas
respondToLostFound(lostFoundId, message, locationDetails, photoUrl)
updateResponseStatus(responseId, status)
```

#### API Routes
- `GET /api/lost-found?page=X&pageSize=Y&type=&species=&city=` - Paginación

### 📁 Estructura de Archivos

```
src/
├── app/lost-found/
│   ├── page.tsx                    # Feed principal
│   ├── actions.ts                  # Server actions
│   ├── s3-actions.ts              # Manejo de uploads
│   ├── [id]/page.tsx              # Detalle
│   ├── report/page.tsx            # Crear reporte
│   └── my-reports/page.tsx        # Mis reportes
├── components/lost-found/
│   ├── LostFoundClient.tsx        # Cliente del feed
│   ├── LostFoundCard.tsx          # Tarjeta de mascota
│   ├── LostFoundSkeleton.tsx      # Loading state
│   ├── LostFoundReportClient.tsx  # Formulario
│   ├── LostFoundDetailClient.tsx  # Detalles
│   ├── MyLostFoundClient.tsx      # Mis reportes
│   └── LostFoundFilters.tsx       # Filtros
├── api/lost-found/
│   └── route.ts                   # API endpoint
└── types/index.ts                 # TypeScript types
```

### 🗄️ Tipos TypeScript Nuevos

```typescript
type LostFoundType = 'lost' | 'found'
type LostFoundStatus = 'active' | 'found' | 'resolved'

interface LostFoundPet {
  id: string
  reporter_id: string
  type: LostFoundType
  name: string
  description: string
  species: string
  breed?: string
  color?: string
  gender?: string
  age_description?: string
  distinguishing_features?: string
  // ... más campos
}

interface LostFoundResponse {
  id: string
  lost_found_id: string
  responder_id: string
  message: string
  location_details?: string
  // ... más campos
}
```

## Flujo de Uso

### Para Reportar una Mascota:
1. Click en "+" en el header de `/lost-found`
2. Seleccionar si es perdido o encontrado
3. Completar formulario con detalles
4. Subir fotos (se comprimen automáticamente)
5. Publicar reporte

### Para Responder a un Reporte:
1. Entrar al detalle de una mascota `/lost-found/[id]`
2. Click en "Tengo información"
3. Describir dónde se vio / qué información tienes
4. Enviar respuesta

### Para Gestionar Reportes:
1. Ir a "Mis reportes" desde `/lost-found`
2. Ver, editar o eliminar reportes propios
3. Ver respuestas recibidas
4. Cambiar estado: "Encontrado" o "Resuelto"

## Características Pendientes (Fase 2)

- [ ] Editar reportes existentes
- [ ] Búsqueda geográfica avanzada con maps
- [ ] Notificaciones por email/SMS
- [ ] Historial de cambios
- [ ] Reportes denunciados/spam
- [ ] Sistema de estadísticas
- [ ] Integración con redes sociales para compartir
- [ ] Chat en tiempo real con respondedores
- [ ] Recompensas/puntos

## Parámetros de Búsqueda

En `/lost-found` puedes usar query params:
```
?type=lost         # Solo mascotas perdidas
?type=found        # Solo mascotas encontradas
?species=dog       # Solo perros
?species=cat       # Solo gatos
?city=CABA         # Por ciudad
?status=active     # Solo activos (default)
```

## Variables de Entorno Necesarias

```env
AWS_BUCKET_NAME=tu-bucket
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## SQL para Ejecutar en Supabase

Ejecutar el archivo: `supabase/lost_found.sql`

Crea automáticamente:
- Enums: `lost_found_type`, `lost_found_status`
- Tablas: `lost_found_pets`, `lost_found_pet_images`, `lost_found_responses`
- Índices para búsquedas eficientes

## Notas Importantes

1. **Imágenes**: Se comprimen automáticamente antes de subir a S3
2. **Seguridad**: Solo el dueño puede eliminar/editar sus reportes
3. **S3 Presigned URLs**: Los uploads usan presigned URLs seguras
4. **Paginación**: Carga infinita al scroll
5. **Responsivo**: Diseño mobile-first
6. **Estilos**: Usa Tailwind + design system del proyecto

## Prueba Rápida

1. Ejecuta el SQL en Supabase
2. Navega a `/lost-found`
3. Click en "+" para crear reporte
4. Sube fotos y completa el formulario
5. Publica
6. Desde otro usuario, entra al reporte y responde

---

Módulo creado: 22/05/2026
Compatible con el design system de Pawndr
