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
    address: 'Address is required.',
    city: 'City is required.',
    facebookFormat: 'Facebook username must start with "/"',
    incompleteAddressBeforeAdding:
      'Complete the current address before adding another one',
    incompleteShipping:
      'Please complete all shipping address fields before adding a new one.',
    instagramFormat: 'Instagram handle must start with "@"',
    invalidDeliveryDate: 'The delivery date must be after the order date.',
    phone: 'Phone is required.',
    positiveNumber: 'Value must be greater than 0',
    requiredFields: 'Please fill all required fields.',
    zip: 'ZIP code is required.',
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
      socialAdded: 'Social media added',
      updated: 'Order updated!',
    },
    product: {
      added: 'Product added successfully!',
    },
    user: {
      created: 'User created successfully.',
    },
  },

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

    name: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    email: 'Email',
    addUpdate: 'Add/Update',
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
    phoneShipping: 'Phone (shipping)',

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
