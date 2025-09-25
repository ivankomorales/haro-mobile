// locales/es.js
// Mismas claves; valores en español

export const es = {
  app: {
    name: 'Haro Mobile',
  },

  nav: {
    main: 'Principal',
    home: 'Inicio',
    orders: 'Pedidos',
    users: 'Usuarios',
    catalog: 'Catálogo',
    products: 'Productos',
    // glazes: usa glaze.list existente
  },

  // ─── ERRORES & VALIDACIÓN ────────────────────────────────
  errors: {
    zip: { mx5digits: 'El CP debe tener 5 dígitos' },
    user: {
      invalidEmail: 'Formato de email inválido.',
      invalidPhone: 'El teléfono debe tener 10 dígitos',
      nameRequired: 'El nombre de usuario es obligatorio.',
    },
    address: {
      missingAddress: 'La dirección es obligatoria',
      missingCity: 'La ciudad es obligatoria',
      missingZip: 'El código postal es obligatorio',
      missingPhone: 'El teléfono es obligatorio',
    },
    customer: {
      missingName: 'El nombre del cliente es obligatorio.',
      missingLastName: 'El apellido del cliente es obligatorio.',
    },
    glaze: {
      fetchFailed: 'No se pudieron cargar los esmaltes. Intenta de nuevo.',
    },
    image: {
      uploadFailed: 'Error al subir las imágenes. Intenta de nuevo.',
    },
    order: {
      createFailed: 'Ocurrió un error al crear el pedido.',
      deliverDateBeforeCreation: 'La fecha de entrega no puede ser anterior a la fecha del pedido.',
      missingProduct: 'Debes agregar al menos un producto antes de continuar.',
      missingDate: 'La fecha del pedido es obligatoria.',
      notFound: 'Error al cargar el pedido',
    },
    product: {
      priceInvalid: 'Precio inválido.',
      addFailed: 'No se pudo agregar el producto.',
      figuresRequired: 'Las figuras deben ser al menos 1.',
      discountInvalid: 'El descuento no puede exceder el precio.',
      typeRequired: 'El tipo de producto es obligatorio.',
    },
  },

  validation: {
    address: 'La dirección es obligatoria.',
    street: 'La calle es obligatoria',
    state: 'El estado es obligatorio',
    country: 'El país es obligatorio',
    city: 'La ciudad es obligatoria',
    zip: 'El código postal es obligatorio',
    phone: 'El teléfono es obligatorio',

    facebookFormat: 'El usuario de Facebook debe comenzar con “/”',
    incompleteAddressBeforeAdding: 'Completa la dirección actual antes de agregar otra.',
    incompleteShipping: 'Completa todos los campos de envío antes de agregar una nueva dirección.',
    instagramFormat: 'El usuario de Instagram debe comenzar con “@”',
    nameOnlyLetters: 'El nombre solo puede contener letras.',
    lastNameOnlyLetters: 'El apellido solo puede contener letras.',
    invalidDeliveryDate: 'La fecha de entrega debe ser posterior a la fecha del pedido.',

    positiveNumber: 'El valor debe ser mayor que 0',
    requiredFields: 'Por favor, completa todos los campos obligatorios.',
  },

  // ─── ÉXITO ─────────────────────────────────────────────
  success: {
    glaze: {
      added: 'Esmalte agregado correctamente.',
      loaded: 'Esmaltes cargados correctamente.',
      created: 'Esmalte creado correctamente.',
      updated: 'Esmalte actualizado correctamente.',
      activated: 'Esmalte activado',
      deactivated: 'Esmalte desactivado',
    },
    image: {
      uploaded: '¡Imágenes subidas correctamente!',
    },
    order: {
      baseCreated: 'Pedido base (borrador) creado.',
      created: 'Pedido creado correctamente.',
      socialAdded: 'Redes sociales agregadas',
      updated: '¡Pedido actualizado!',
      cancelled: 'Pedido cancelado',
    },
    product: {
      added: '¡Producto agregado correctamente!',
      updated: '¡Producto actualizado!',
    },
    user: {
      created: 'Usuario creado correctamente.',
    },
  },

  // CONTEXT
  // ─────────────── AUTHCONTEXT ──────────────────────
  auth: {
    loginFailed: 'Email o contraseña inválidos.',
    serverError: 'Error del servidor. Intenta más tarde.',
    sessionExpired: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
    loggedOut: 'Cerraste sesión correctamente.',
    invalidToken: 'Respuesta de inicio de sesión inválida. Contacta soporte.',
    validationError: 'La validación falló.',
    requestError: 'La solicitud falló',
    unknownError: 'No se pudo procesar la respuesta del servidor',
    //OLD ONES
    emailRequired: 'El email es obligatorio.',
    missingFields: 'Por favor, completa todos los campos.',
    passwordRequired: 'La contraseña es obligatoria.',
  },

  // COMPONENTS
  //BOTTOM NAV BAR
  navBar: {
    home: 'Inicio',
    orders: 'Pedidos',
    newOrder: 'Nuevo Pedido',
    glazes: 'Esmaltes',
    profile: 'Perfil',
  },

  //  ─────────────────────────── PÁGINAS  ───────────────────────────
  // GLAZES
  glaze: {
    title: 'Esmalte',
    name: 'Nombre del esmalte',
    code: 'Código (opcional)',
    new: 'Nuevo esmalte',
    list: 'Esmaltes',
    creating: 'Creando esmalte',
    updating: 'Actualizando esmalte...',
    updateFailed: 'Error al actualizar el esmalte.',

    loading: 'Cargando esmaltes...',
    empty: 'Sin esmaltes',
    searchPlaceholder: 'Buscar por nombre, código, hex…',

    noCode: 'Sin código',
    hex: 'Hex',
    noHex: 'Sin hex',

    confirm: {
      activate: {
        title: '¿Activar esmalte?',
        message: 'Este esmalte quedará activo y disponible para selección.',
        confirm: 'Sí, activar',
      },
      deactivate: {
        title: '¿Desactivar esmalte?',
        message: 'Este esmalte quedará inactivo y se ocultará de la selección.',
        confirm: 'Sí, desactivar',
      },
    },
  },

  // USERS
  user: {
    title: 'Crear usuario',
    label: 'Usuario',

    name: 'Nombre',
    lastName: 'Apellido',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    employee: 'Empleado',
    admin: 'Admin',
  },

  // ───────────────────── HOME ───────────────────────────
  home: {
    title: 'Inicio',
    pendingTitle: 'Pedidos pendientes',
    updatedAt: 'Última actualización:',
    recentTitle: 'Pedidos recientes',
    status: 'Estatus',
    loading: 'Cargando',
  },

  // ───────────────────── ORDERS ───────────────────────────
  order: {
    title: 'Pedidos',
    label: 'Pedido',
    // ─── Información del cliente ──────────────────────────
    name: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    email: 'Email',
    addUpdate: 'Agregar/Actualizar',
    deposit: 'Anticipo',
    subtotal: 'Subtotal',
    total: 'Total',

    confirm: 'Confirmar pedido',
    moreInfo: 'Más info',
    social: 'Redes sociales',
    editLabel: 'Editar',
    submit: 'Confirmar',
    editCustomer: 'Editar cliente',
    remove: 'Eliminar',
    newTitle: 'Nuevo Pedido',
    editTitle: 'Editar Pedido',
    addProduct: 'Agregar producto',

    status: 'Estatus del pedido',

    notes: 'Notas',
    datePlaceholder: 'DD/MM/AAAA',

    search: 'Buscar por ORD#, nombre o email.',
    details: 'Detalles del pedido',

    exportingPDF: 'Generando PDF...',
    exportingXLS: 'Exportando a Excel...',
    noneSelected: 'No has seleccionado ningún pedido.',
    exportError: 'Error al exportar pedidos.',
    exportExcelPending: 'Exportación a Excel aún no disponible.',
    exportWordPending: 'Exportación a Word aún no disponible.',

    updatingStatus: 'Actualizando estatus...',
    statusUpdated: 'Estatus actualizados correctamente.',
    updateError: 'Error al actualizar estatus.',
    empty: 'No se encontraron pedidos',
    loading: 'Cargando pedidos',

    entries: 'entradas',
    add: 'Agregar nuevo',

    all: 'Todos los pedidos',
    // ─── Secciones ──────────────────────────────────────────
    section: {
      customerInfo: 'Información del cliente',
      customerInfoHint: 'Datos básicos del cliente y redes sociales.',
      orderInfo: 'Información del pedido',
      orderInfoHint: 'Fechas, estatus, pago y preferencia de envío.',
      orderSummary: 'Resumen del pedido',
    },

    // ─── Envío ──────────────────────────────────────────
    shippingHint: 'Actívalo para agregar una o más direcciones de envío.',
    shippingEmptyTitle: 'Sin direcciones aún',
    shippingEmptyHint: 'Agrega al menos una dirección si se requiere entrega.',
    shippingRequired: 'Requiere envío',
    shippingAddress: 'Dirección de envío',
    addAddress: '+ Agregar dirección',
    address: 'Dirección',
    street: 'Calle',
    city: 'Ciudad',
    state: 'Estado',
    zip: 'Código postal',
    country: 'País',
    phoneShipping: 'Teléfono (envío)',
    reference: 'Referencia',

    // ─── Fechas ────────────────────
    orderDate: 'Fecha del pedido',
    deliveryDate: 'Fecha de entrega',

    // ─── Código de país ─────────────────────────────
    countryCode: 'Código de país',
  },

  // AddProduct
  product: {
    title: 'Agregar producto',
    edit: 'Editar producto',
    type: 'Tipo',
    select: 'Selecciona un producto',
    description: 'Descripción',
    product: 'Ítem',
    qty: 'Cantidad',
    price: 'Precio',
    pricePrefix: '$',
    discount: 'Descuento',
    added: 'Producto agregado',
    addedOther: 'Productos agregados',

    glazeTitle: 'Esmalte',
    glazeInt: 'Interior',
    glazeExt: 'Exterior',
    glazeSearch: 'Buscar esmalte',
    glazeNone: 'Sin esmalte',
    glazeNoResult: 'Sin resultados',

    images: 'Imágenes',

    addButton: 'Agregar producto',

    figure: 'Figura',
    cup: 'Taza',
    handmadeCup: 'Taza artesanal',
    plate: 'Plato',
    figurine: 'Figurita',
    // Section
    section: {
      customerInfo: 'Información del cliente',
      productInfo: 'Información del producto',
      productInfoHint: 'Selecciona el tipo, la cantidad y el precio.',
      productDetails: 'Detalles del producto',
      productDetailsHint: 'Ajusta figuras, esmaltes y personalización.',
    },
    figuresCountLabel: 'No. de figuras:',
    glazes: 'Esmaltes',
    decorations: 'Decoraciones y personalización',
    hasGoldHint: 'Aplicado en bordes y detalles.',
    hasNameHint: 'Agrega un nombre corto a la pieza.',
    hasGold: 'Detalles en oro',
    hasName: 'Nombre personalizado',
  },

  cart: {
    empty: 'Aún no has agregado productos.',
    subtotal: 'Subtotal',
    orderSummary: 'Resumen del pedido',
    payment: 'Pago',
    balance: 'Saldo',
    deposit: 'Anticipo',
    discounts: 'Descuentos',
    orderTotal: 'Total del pedido',
    total: 'Total',
  },

  // ─────────────── SplitAction ──────────────────────
  splitAction: {
    new: 'Nuevo',
    order: 'Pedido',
    user: 'Usuario',
    glaze: 'Esmalte',
  },

  // ─────────────── STATUS ──────────────────────
  status: {
    label: 'Estatus',
    all: 'Todos',
    new: 'Nuevo',
    inProgress: 'En progreso',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    unknown: 'Desconocido',
    active: 'Activo',
    inactive: 'Inactivo',
  },

  // FORM ACTIONS
  formActions: {
    confirm: 'Confirmar',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    confirmTitle: '¿Estás seguro?',
    confirmMessage: 'Se perderán todos los datos. ¿Continuar?',
    confirmText: 'Sí, salir',
    cancelText: 'No, permanecer',
  },

  formActionsCreate: {
    confirmTitle: '¿Cancelar creación?',
    confirmMessage: 'Se perderán todos los datos.',
  },

  formActionsEdit: {
    confirmTitle: '¿Cancelar edición?',
    confirmMessage: 'Los cambios no guardados se perderán.',
  },

  formActionsConfirm: {
    confirmTitle: '¡Atención!',
    confirmMessage: 'Si cancelas ahora, se borrará tu progreso.',
  },

  // BUTTONS / ACTIONS
  button: {
    confirm: 'Confirmar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    cancelEdit: 'Cancelar edición',
    ok: 'OK',
    search: 'Buscar',
    close: 'Cerrar',

    addProduct: 'Agregar producto',
    addGlaze: 'Agregar esmalte',
    back: 'Regresar',

    login: 'Iniciar sesión',

    clear: 'Limpiar',
    apply: 'Aplicar',

    edit: 'Editar',
    activate: 'Activar',
    deactivate: 'Desactivar',
    exportPdf: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    changeStatus: 'Cambiar estatus',
    checkout: 'Finalizar',
  },

  messages: {
    selectAtLeastOneOrder: 'Selecciona al menos 1 pedido',
  },

  sort: {
    by: 'Ordenar por',
  },

  // ARIA
  aria: {
    editProduct: 'Editar producto',
    removeProduct: 'Quitar producto',
  },

  // COMMONS
  common: {
    cancel: 'Cancelar',
    working: 'Trabajando…',
    na: 'N/D',
    delete: 'Eliminar',
  },

  // pagination
  pagination: {
    previous: 'Anterior',
    next: 'Siguiente',
    rowsPerPage: 'Filas/página',
    of: 'de',
  },

  // chips (includes tabs)
  chip: {
    remove: 'Quitar',
    removeAll: 'Quitar todos',
    active: 'Activo',
    inactive: 'Inactivo',
    all: 'Todos',
  },

  // ─── TABLE HEADERS (unified) ─────────────────────────────
  headers: {
    // Glazes & general
    image: 'Imagen',
    name: 'Nombre',
    code: 'Código',
    hex: 'Hex',
    status: 'Estatus',
    actions: 'Acciones',
    net: 'Ventas netas',

    // Orders-specific
    orderID: 'ORD#',
    customer: 'Cliente',
    orderDate: 'Fecha',
    total: 'Total',
  },

  filters: {
    title: 'Filtros',
  },

  labels: {
    from: 'Desde',
    to: 'Hasta',
    urgent: 'Urgente',
    shippingRequired: 'Envío',
    ignore: 'Ignorar',
    yes: 'Sí',
    no: 'No',
    orderLoading: 'Cargando pedidos...',
    orderLoadingError: 'Error al cargar pedidos',
  },

  // ─── STATS ───────────────────────────
  stats: {
    thisMonth: 'Este mes',
    pending: 'Pendiente',
    completed: 'Completado',
    // ── NEW ──
    inProgress: 'En progreso',
    cancelled: 'Cancelado',
    inRange: 'Pedidos',
    netSales: 'Ventas netas',
    amountDue: 'Por cobrar',

    grossMinusDeposit: 'Bruto − Anticipo',
    range: 'Rango',
    week: 'Últimos 7 días',
    '15d': 'Últimos 15 días',
    '30d': 'Últimos 30 días',
    month: 'Este mes',
    quarter: 'Este trimestre',
    year: 'Este año',
    all: 'Todo el tiempo',
    total: 'Total',
  },

  // STATUSMODAL
  statusModal: {
    title: 'Cambiar estatus',
    subtitle: 'Selecciona el nuevo estatus',
  },

  //EXCELMODAL
  exportModal: {
    title: 'Exportar a Excel / CSV',
    searchPlaceholder: 'Buscar campos…',
    selectAll: 'Seleccionar todo',
    clear: 'Limpiar',
    savePrefs: 'Guardar preferencia',
    prefsSaved: 'Preferencias guardadas',
    prefsSaveError: 'No se pudieron guardar las preferencias ❌',
    export: 'Exportar',
    exportStarted: '¡Exportación iniciada!',
    noResults: 'No hay campos que coincidan con tu búsqueda.',
    selectedCount: 'Seleccionados:',
  },

  fields: {
    orderID: 'ID de pedido',
    customerName: 'Nombre del cliente',
    customerPhone: 'Teléfono del cliente',
    customerEmail: 'Email del cliente',
    status: 'Estatus',
    isUrgent: '¿Urgente?',
    orderDate: 'Fecha',
    deliverDate: 'Fecha de entrega',
    notes: 'Notas',
    productIndex: 'Índice de producto',
    productType: 'Tipo de producto',
    productDescription: 'Descripción del producto',
    glazeInteriorName: 'Esmalte interior',
    glazeInteriorHex: 'Esmalte interior (hex)',
    glazeExteriorName: 'Esmalte exterior',
    glazeExteriorHex: 'Esmalte exterior (hex)',
  },

  login: {
    email: 'Email',
    password: 'Contraseña',
  },

  confirm: {
    cancelOrder: {
      title: 'Cancelar pedido',
      message: '¿Seguro que deseas cancelar este pedido?',
    },
  },

  loading: {
    image: 'Cargando imágenes...',
    orderCreate: 'Creando pedido',
  },

  invoice: {
    product: 'Producto',
    qty: 'Cant.',
    rate: 'Tarifa',
    amount: 'Importe',
  },
}
