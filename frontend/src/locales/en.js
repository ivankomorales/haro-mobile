// locales/en.js
// Access these messages via utils/getMessage.js using dot notation keys

export const en = {
  // ─── ERRORS & VALIDATION ──────────────────────────────── (KEEP THESE)
  errors: {
    address: {
      missingAddress: 'Address is required',
      missingCity: 'City is required',
      missingZip: 'ZIP code is required',
      missingPhone: 'Phone number is required',
    },
    customer: {
      missingName: 'Customer name is required.',
      missingLastName: 'Customer last name is required.',
    },
    glaze: {
      fetchFailed: 'Could not load glazes. Please try again.',
    },
    image: {
      uploadFailed: 'Failed to upload images. Please try again.',
    },
    order: {
      createFailed: 'Something went wrong while creating the order.',
      deliverDateBeforeCreation:
        'Delivery date cannot be earlier than order date.',
      missingProduct: 'You must add at least one product before continuing.',
      missingDate: 'Order date is required.',
      notFound: 'Error loading order',
    },
    user: {
      invalidEmail: 'Invalid email format.',
      invalidPhone: 'Phone number must be 10 digits.',
      nameRequired: 'User name is required.',
    },
    product: {
      typeRequired: 'Type is required.',
      priceInvalid: 'Invalid price.',
      addFailed: 'Failed to add product.',
    },
  },

  validation: {
    facebookFormat: 'Facebook must start with /',
    incompleteAddressBeforeAdding:
      'Complete the current address before adding another one',
    incompleteShipping: 'Complete all the shipping address fields',
    instagramFormat: 'Instagram must start with @',
    invalidDeliveryDate: 'Delivery date cannot be earlier than order date',
    missingShippingAddress: 'Please add at least one shipping address',
    requiredFields: 'Please fill all required fields',
    positiveNumber: 'Value must be greater than 0',
  },

  // ─── SUCCESS ─────────────────────────────────────────────
  success: {
    glaze: {
      added: 'Glaze added successfully.',
      loaded: 'Glazes loaded successfully.',
    },
    image: {
      uploaded: 'Images uploaded successfully!',
    },
    order: {
      baseCreated: 'Base order (draft) created.',
      created: 'Order created successfully.',
      updated: 'Order updated!',
      socialAdded: 'Social media added',
    },
    product: {
      added: 'Product added successfully!',
    },
    user: {
      created: 'User created successfully.',
    },
  },

  // ─── LABELS ────────────────────────────────────────────── TO REMOVE
  labels: {
    common: {
      noResults: 'No results',
    },
    general: {
      email: 'Email',
      name: 'Name',
      notes: 'Notes',
      phone: 'Phone',
    },
    // glaze: {
    //   title: 'Glaze REMOVE', // nombre genérico
    //   none: 'No glaze REMOVE', // opción "sin esmalte"
    //   noResults: 'No results REMOVE',
    //   interior: 'Interior: REMOVE', // etiqueta para interior
    //   exterior: 'Exterior: REMOVE', // etiqueta para exterior
    // },
    order: {
      // TO REMOVE
      addProduct: 'Add Product',
      deliveryDate: 'Delivery Date',
      submit: 'Create Order',
      confirm: 'Confirm Order',
      status: 'Status', // DUPLICATE, REMOVE
      deposit: 'Deposit', // REMOVE
      notes: 'Notes', // REMOVE
      details: 'Order DetailsREMOVE',
    },
    product: {
      // Nombres de campos que se ven en el formulario
      type: 'Type',
      quantity: 'Quantity',
      price: 'Price',
      description: 'Description REMOVE',
      images: 'Images',
    },
    orders: {
      title: 'Orders',
      empty: 'No orders found',
    },
  },

  // ───────────────────── FORMS ─────────────────────────── TO REMOVE
  forms: {
    glaze: {
      select: 'Select glaze',
      search: 'Search glaze',
    },
    product: {
      // {t('forms.product.')}
      title: 'Add Product REMOVE',
      figure: 'FigureREMOVE', // Figures that go inside the Cups, or Plates
      types: {
        cup: 'CupREMOVE',
        handmadeCup: 'Handmade Cup REMOVE',
        plate: 'Plate REMOVE',
        figurine: 'Figurine REMOVE',
      },
      placeholders: {
        type: 'Type',
        select: 'Select a product',
        quantity: 'Enter quantity',
        price: '$',
        description: 'Short description (optional)',
        images: 'Add images',
      },
      help: {
        // REMOVE
        quantity: 'Minimum: 1',
        price: 'Use numbers only',
        glaze: 'Interior glaze is optional for plates', // To remove, no make sense
      },
      buttons: {
        // REMOVE
        add: 'Add',
        confirm: 'Confirm',
        addProduct: 'Add ProductREMOVE',
        proceed: 'Proceed',
        shipping: 'Requires shipping?', // REMOVE
        save: 'Save Product',
      },
      // Textos del UI que no encajan en labels/errores TO REMOVE
      sections: {
        glaze: 'Glaze', // Duplicated
        addedProducts: 'Added products:',
      },
      messages: {
        scrollAfterAdd: 'Scrolling to the bottom…',
      },
    },
    shipping: {
      remove: 'Remove',
      shippingAddress: 'Shipping address',
      add: '+ Add address',
      address: 'Address',
      country: 'Country',
      street: 'Street',
      city: 'City',
      zip: 'ZIP',
      phone: 'Phone (shippingREMOVE)',
      dateFormat: 'dd-mm-yyyy', // dd-mm-aaaa ES
    },
    payment: {
      subtotal: 'Subtotal', // {t('forms.payment.subtotal')}
      advance: 'Advance',
      total: 'Total',
    },
  },

  // ─── FORM ACTIONS & CONFIRM MODALS (FOOTER ONLY)─────────────────────── TO REMOVE
  // formActions: {
  //   cancel: 'Cancel', // REMOVE
  //   submitDefault: 'Submit',
  //   confirmTitle: 'Cancel?', // REMOVE
  //   confirmMessage: 'You will lose unsaved changes if you exit now.', // REMOVE
  //   confirmText: 'Yes, exit', // REMOVE
  //   cancelText: 'No, stay', // REMOVE
  //   saveChanges: 'Save Changes',
  // },
  formActionsUser: {
    cancel: 'Cancel',
    submitDefault: 'Create User',
    confirmTitle: 'Cancel creating user?',
    confirmMessage: 'All entered user data will be lost if you exit.',
    //confirmText: 'Yes, changed my mind',
    //cancelText: 'No, keep editing',
  },
  formActionsGlaze: {
    cancel: 'Cancel',
    submitDefault: 'Add Glaze',
    confirmTitle: 'Cancel glaze creation?',
    confirmMessage: 'You will lose the glaze configuration if you exit.',
    //confirmText: 'Yes, discard glaze',
    //cancelText: 'No, keep working',
  },
  formActionsOrder: {
    cancel: 'Cancel',
    submitDefault: 'Create Order',
    confirmTitle: 'Cancel this order?',
    confirmMessage: 'All progress in the order will be lost.',
    //confirmText: 'Yes, cancel order',
    //cancelText: 'No, go back',
  },
  formActionsProduct: {
    cancel: 'Cancel',
    submitDefault: 'Proceed',
    confirmTitle: 'Cancel this order?',
    confirmMessage: 'All progress in the order will be lost.',
    //confirmText: 'Yes, cancel order',
    //cancelText: 'No, go back',
  },

  confirm: {
    exitFlowTitle: 'Cancel creation?',
    exitFlowMessage: 'If you leave now, you will lose all unsaved changes.',
    exitFlowConfirm: 'Yes, exit',
    exitFlowCancel: 'No, stay',
  },

  // NEW ORGANIZATION (DO NOT REMOVE THE BELOW)
  // ─── LOADING STATES ──────────────────────────────────────
  loading: {
    generic: 'Loading...',
    image: 'Uploading images...',
    orderCreate: 'Creating order...',
    user: 'Registering user...',
    order: 'Loading order...',
    orders: 'Loading orders...',
  },

  // ─── INFO MESSAGES ───────────────────────────────────────
  info: {
    logout: 'You have been logged out.',
    welcome: 'Welcome to Haro Mobile!',
  },

  // ─── TITLES ────────────────────────────────────────────── // TO REFACTOR
  titles: {
    // NEW/ EDIT ORDER
    editOrder: 'Edit Order', // REMOVE
    newOrder: 'New Order', // REMOVE

    // ADD/ EDIT PRODUCT
    editProduct: 'Edit Product',
    addProduct: 'Add Product',
  },

  // COMPONENTS
  // AddressInput CHECKED
  // AppBar
  // BottomNavBar
  // ConfirmModal
  // FormActions
  // FormAddress
  // GlazeSelect
  // ImageUploader
  // OrderDetailsCard
  // ScrollToTop
  // Sidebar
  // SplitActionButton

  // CONTEXT
  // ─────────────── AUTHCONTEXT ──────────────────────
  auth: {
    loginFailed: 'Invalid email or password.',
    serverError: 'Server error. Please try again later.',
    sessionExpired: 'Your session has expired. Please log in again.',
    loggedOut: 'You have been logged out successfully.',
    invalidToken: 'Invalid login response. Please contact support.',
    validationError: 'Validation failed.',
    requestError: 'Request failed',
    unknownError: 'Server response could not be processed',
    //OLD ONES
    emailRequired: 'Email is required.',
    missingFields: 'Please fill in all fields.',
    passwordRequired: 'Password is required.',
  },
  //  ─────────────────────────── PAGES  ───────────────────────────
  // GLAZES
  // AddGlaze
  glaze: {
    title: 'Glaze',
    name: 'Glaze Name',
    code: 'Code (optional)',
  },
  // ORDERS DONE BELOW
  // AddProduct DONE BELOW

  // EditOrder FUSED WITH ORDER

  // NewOrder  FUSED WITH ORDER

  // OrderConfirmation  FUSED WITH ORDER

  // OrderDetails  FUSED WITH ORDER

  // Orders  FUSED WITH ORDER

  // USERS
  // AddUser
  user: {
    title: 'Create User',
    label: 'User',

    name: 'Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    employee: 'Employee',
    admin: 'Admin',
  },
  // UserProfile

  // ───────────────────── HOME ───────────────────────────
  home: {
    title: 'Home',
    pendingTitle: 'Pending Orders',
    updatedAt: 'Last updated:', //Última actualización:
    recentTitle: 'Recent Orders',
    status: 'Status',
  },

  // ───────────────────── ORDERS ───────────────────────────
  order: {
    title: 'Orders',
    label: 'Order',

    deposit: 'Deposit',
    subtotal: 'Subtotal',
    total: 'Total',

    confirm: 'Confirm Order',
    moreInfo: 'More info',
    social: 'Social Media',
    editLabel: 'Edit',

    addAddress: '+ Add Address',
    address: 'Address',
    city: 'City',
    zip: 'ZIP code',
    phone: 'Phone (shipping)',

    remove: 'Remove',
    newTitle: 'New Order',
    editTitle: 'Edit Order',
    addProduct: 'Add product',
    shippingRequired: 'Requires shipping',
    shippingAddress: 'Shipping address',
    status: 'Order status',

    notes: 'Notes',
    datePlaceholder: 'DD/MM/YYYY',

    search: 'Name, email, orderID',
    details: 'Order Details',

    exporting: 'Generando PDF...',
    noneSelected: 'No has seleccionado ningún pedido.',
    exportError: 'Error al exportar los pedidos.',
    exportExcelPending: 'La exportación a Excel aún no está disponible.',
    exportWordPending: 'La exportación a Word aún no está disponible.',

    updatingStatus: 'Actualizando estado...',
    statusUpdated: 'Estados actualizados correctamente.',
    updateError: 'No se pudo actualizar el estado.',
  },

  // AddProduct
  product: {
    title: 'Add Product',
    edit: 'Edit Product',
    type: 'Type',
    select: 'Select a product',
    description: 'Description', // Consider using a general i18n

    qty: 'Quantity',
    price: 'Price',
    pricePrefix: '$',
    added: 'Product added',

    glazeTitle: 'Glaze',
    glazeInt: 'Interior',
    glazeExt: 'Exterior',
    glazeSearch: 'Search Glaze', //Consider using a general search: 'Type in to search'
    glazeNone: 'No glaze (Transparent)',
    glazeNoResult: 'No results', // Consider using a general noResults: 'No results'

    images: 'Images',

    addButton: 'Add Product',
    added: 'Added products',

    figure: 'Figure',
    cup: 'Cup',
    handmadeCup: 'Handmade Cup',
    plate: 'Plate',
    figurine: 'Figurine',
  },
  // ─────────────── SplitAction ──────────────────────
  splitAction: {
    new: '+ New',
    order: 'Order',
    user: 'User',
    glaze: 'Glaze',
  },

  // ─────────────── STATUS ──────────────────────
  status: {
    // First Capital for Status as Backend uses them like that
    label: 'Status',
    all: 'All',
    new: 'New',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },

  // FORMACTIONS abv. fa
  // Consider simplifying like keeping only formActions, formActionsCreate and formActionsEdit 3/8/2025 -Ivan
  formActions: {
    saveChanges: 'Save changes',
    cancel: 'Cancel', //Duplicated on BUTTONS
    confirmTitle: 'Are you sure?',
    confirmMessage: 'All data will be lost. Continue?',
    confirmText: 'Yes, exit',
    cancelText: 'No, stay',
  },

  formActionsCreate: {
    confirmTitle: 'Cancel creating?',
    confirmMessage: 'All data will be lost.',
  },

  formActionsEdit: {
    confirmTitle: 'Cancel editing?',
    confirmMessage: 'Unsaved changes will be lost.',
  },

  formActionsConfirm: {
    confirmTitle: 'Warning!',
    confirmMessage: 'Cancelling now will erase all your progress.',
  },

  validation: {
    requiredFields: 'Please fill all required fields.',
    invalidDeliveryDate: 'The delivery date must be after the order date.',
    incompleteShipping:
      'Please complete all shipping address fields before adding a new one.',
    instagramFormat: 'Instagram handle must start with "@"',
    facebookFormat: 'Facebook username must start with "/"',
    incompleteAddressBeforeAdding:
      'Complete the current address before adding another one',
    // New per-field validation
    address: 'Address is required.',
    city: 'City is required.',
    zip: 'ZIP code is required.',
    phone: 'Phone is required.',
  },

  // BUTTONS
  button: {
    confirm: 'Confirm',
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK',
    search: 'Search', // Used as a Label as well
    close: 'Close',

    addProduct: 'Add Product',
    addGlaze: 'Add Glaze',
    back: 'Back',

    login: 'Log in',
  },

  // LOGIN
  login: {
    email: 'Email address',
    password: 'Password',
  },

  // STATUSMODAL
  statusModal: {
    pending: 'Pending',
    title: 'Change status',
    subtitle: 'New status',
  },
}
