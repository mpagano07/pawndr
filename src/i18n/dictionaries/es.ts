import { Dictionary } from './en'

export const es: Dictionary = {
  common: {
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de usuario',
    welcomeBack: 'Bienvenido de nuevo',
    joinCommunity: 'Únete a la comunidad',
    noAccount: '¿No tienes una cuenta?',
    hasAccount: '¿Ya tienes una cuenta?',
    createAccount: 'Crear Cuenta',
    save: 'Guardar',
    add: 'Agregar',
    continueWithGoogle: 'Continuar con Google',
    orContinueWith: 'O continuar con',
  },
  landing: {
    subtitle: 'La Comunidad #1 para Mascotas y Dueños',
    titlePart1: 'Conectá, Adoptá y Cuidá',
    titleGradient: 'Tu Comunidad',
    titlePart2: 'Mascotera.',
    description: 'Pawndr une adopciones, mascotas perdidas, encuentros, foros y eventos en una sola plataforma.',
    cta: 'Crear Perfil de Mascota',
    heroCtaPrimary: 'Unirme a la Comunidad',
    heroCtaSecondary: 'Explorar adopciones',
    mainCardLabel: 'Adopción',
    mainCardSubtitle: 'Perros y gatos listos para un hogar amoroso.',
    mainCardTitle: 'Adopta al compañero perfecto',
    lostCardTitle: 'Luna está perdida',
    lostCardLocation: 'Zona Palermo, CABA',
    eventCardTitle: 'Paseo de Mascotas',
    eventCardLocation: 'Parque Centenario',
    categories: {
      encounters: { title: 'Encuentros', desc: 'Encuentra mascotas compatibles para jugar, socializar o criar.' },
      adoption: { title: 'Adopciones', desc: 'Dale un hogar a un peludo que lo necesita.' },
      lostFound: { title: 'Mascotas Perdidas', desc: 'Publica y ayuda a encontrar mascotas desaparecidas.' },
      community: { title: 'Comunidad', desc: 'Participa en foros, haz preguntas y comparte experiencias.' },
      events: { title: 'Eventos', desc: 'Descubre eventos, encuentros y actividades para mascotas.' },
      nearby: { title: 'Cerca tuyo', desc: 'Encontrá todo lo que tu mascota necesita en tu área.' },
    },
    stats: {
      pets: 'Mascotas registradas',
      adoptions: 'Adopciones realizadas',
      reunions: 'Mascotas reunidas',
      members: 'Miembros en la comunidad',
    },
    features: {
      local: { title: 'Descubrimiento Local', desc: 'Encuentra mascotas cercanas usando nuestro avanzado sistema de geolocalización y filtros.' },
      chat: { title: 'Chat en Tiempo Real', desc: 'Conéctate al instante y planea encuentros con otros dueños cuando hagan match.' },
      safe: { title: 'Seguro y Confiable', desc: 'Perfiles verificados y un robusto sistema de reportes mantienen nuestra comunidad segura.' }
    }
  },
  profile: {
    title: 'Mi Perfil',
    setup: 'Configura tu perfil',
    fullName: 'Nombre Completo',
    bio: 'Biografía',
    saveProfile: 'Guardar Perfil',
    myPets: 'Mis Mascotas',
    noPets: "Aún no has agregado ninguna mascota.",
    addNewPet: 'Agregar Nueva Mascota',
    petName: 'Nombre',
    petBreed: 'Raza',
    petAge: 'Edad',
    petGender: 'Sexo',
    petMale: 'Macho',
    petFemale: 'Hembra',
    petBio: 'Biografía de la Mascota',
    addPetBtn: 'Agregar Mascota',
    petAdded: '¡Mascota agregada con éxito! 🐾'
  },
  feed: {
    discover: 'Descubrir',
    noMorePets: 'No hay más mascotas cerca',
    noMoreDesc: "Has visto todas las mascotas en tu área. ¡Vuelve más tarde para ver más perfiles!",
    refresh: 'Actualizar',
    itsAMatch: "¡Es un Match!",
    youAnd: 'Tú y',
    likedEachOther: 'se gustaron mutuamente.',
    sendMessage: 'Enviar Mensaje',
    keepSwiping: 'Seguir Deslizando'
  },
  nav: {
    feed: 'Inicio',
    matches: 'Matches',
    profile: 'Perfil',
    services: 'Servicios'
  },
  services: {
    title: 'Servicios para Mascotas',
    subtitle: 'Encuentra lo mejor para tu mascota cerca de ti',
    search: 'Buscando servicios cercanos...',
    noResults: 'No se encontraron servicios en esta zona',
    vet: 'Veterinaria',
    shop: 'Pet Shop',
    grooming: 'Peluquería Canina',
    distance: 'de distancia',
    promoted: 'Promocionado',
    searchNearby: 'Explorar servicios cercanos'
  },
  matches: {
    title: 'Tus Matches',
    noMatches: "Aún no tienes matches. ¡Sigue deslizando!",
    chat: 'Chatear'
  },
  chat: {
    placeholder: 'Escribe un mensaje...',
    send: 'Enviar'
  },
  admin: {
    title: 'Panel Administrador',
    stats: 'Estadísticas Globales',
    totalUsers: 'Total de Usuarios',
    totalPets: 'Total de Mascotas',
    totalMatches: 'Total de Matches',
    totalSwipes: 'Total de Swipes',
    unauthorized: 'Acceso No Autorizado',
    backHome: 'Volver al Inicio'
  },
  community: {
    title: 'Comunidad',
    stats: 'Mascotas Cerca',
    events: 'Próximos Eventos',
    join: 'Unirse',
    nearby: 'cerca de ti',
    lookingFor: 'Busco compañero para...',
    createPost: 'Publicar algo',
    createEvent: 'Organizar Evento',
    compatibility: 'Compatibilidad'
  },
  auth: {
    forgotPassword: '¿Olvidaste tu contraseña?',
    resetPasswordTitle: 'Recuperar Contraseña',
    resetPasswordDesc: 'Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.',
    sendRecoveryLink: 'Enviar enlace de recuperación',
    backToLogin: 'Volver a iniciar sesión',
    resetEmailSent: 'Si el correo está registrado, recibirás un enlace de recuperación en unos instantes.',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    updatePassword: 'Actualizar Contraseña',
    passwordUpdatedSuccess: '¡Tu contraseña ha sido actualizada exitosamente!',
    passwordsDoNotMatch: 'Las contraseñas no coinciden.',
    updating: 'Actualizando...',
    sending: 'Enviando...'
  }
}
