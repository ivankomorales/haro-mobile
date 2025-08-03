// locales/en.js
// Access these messages via utils/getMessage.js using dot notation keys

export const en = {
  // ─── ERRORS & VALIDATION ────────────────────────────────
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
    requiredFields: 'Please complete all required fields',
    positiveNumber: 'Value must be greater than 0',
  },

  // ─── SUCCESS ─────────────────────────────────────────────
  success: {
    glaze: {
      added: 'Glaze added successfully.',
      loaded: 'Glazes loaded successfully.',
    },
    image: {
      uploaded: 'Images uploaded successfully.',
    },
    order: {
      created: 'Order created successfully.',
    },
    product: {
      added: 'Product added to order.',
    },
    user: {
      created: 'User created successfully.',
    },
  },

  // ─── LABELS ──────────────────────────────────────────────
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
    glaze: {
      title: 'Glaze', // nombre genérico
      none: 'No glaze', // opción "sin esmalte"
      noResults: 'No results',
      interior: 'Interior:', // etiqueta para interior
      exterior: 'Exterior:', // etiqueta para exterior
    },
    order: {
      addProduct: 'Add Product',
      deliveryDate: 'Delivery Date',
      submit: 'Create Order',
      confirm: 'Confirm Order',
      status: 'Status', // DUPLICATE
      deposit: 'Deposit',
      notes: 'Notes',
      details: 'Order Details',
    },
    product: {
      // Nombres de campos que se ven en el formulario
      type: 'Type',
      quantity: 'Quantity',
      price: 'Price',
      description: 'Description',
      images: 'Images',
    },
    orders: {
      title: 'Orders',
      empty: 'No orders found',
    },
  },

  // ───────────────────── FORMS ───────────────────────────
  forms: {
    glaze: {
      select: 'Select glaze',
      search: 'Search glaze',
    },
    product: {
      // {t('forms.product.')}
      title: 'Add Product',
      figure: 'Figure', // Figures that go inside the Cups, or Plates
      types: {
        cup: 'Cup',
        handmadeCup: 'Handmade Cup',
        plate: 'Plate',
        figurine: 'Figurine',
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
        quantity: 'Minimum: 1',
        price: 'Use numbers only',
        glaze: 'Interior glaze is optional for plates', // To remove, no make sense
      },
      buttons: {
        add: 'Add',
        confirm: 'Confirm',
        addProduct: 'Add Product',
        proceed: 'Proceed',
        shipping: 'Requires shipping?',
        save: 'Save Product',
      },
      // Textos del UI que no encajan en labels/errores
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
      phone: 'Phone (shipping)',
      dateFormat: 'dd-mm-yyyy', // dd-mm-aaaa ES
    },
    payment: {
      subtotal: 'Subtotal', // {t('forms.payment.subtotal')}
      advance: 'Advance',
      total: 'Total',
    },
  },

  // ─── FORM ACTIONS & CONFIRM MODALS (FOOTER ONLY)───────────────────────
  formActions: {
    cancel: 'Cancel',
    submitDefault: 'Submit',
    confirmTitle: 'Cancel?',
    confirmMessage: 'You will lose unsaved changes if you exit now.',
    confirmText: 'Yes, exit',
    cancelText: 'No, stay',
    saveChanges: 'Save Changes',
  },
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

  // NEW ORGANIZATION
  // ─── LOADING STATES ──────────────────────────────────────
  loading: {
    generic: 'Loading...',
    image: 'Uploading image...',
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

  // ─── TITLES ──────────────────────────────────────────────
  titles: {
    // NEW/ EDIT ORDER
    editOrder: 'Edit Order',
    newOrder: 'New Order',

    // ADD/ EDIT PRODUCT
    editProduct: 'Edit Product',
    addProduct: 'Add Product',
  },

  // ───────────────────── HOME ───────────────────────────
  home: {
    title: 'Home',
    pendingTitle: 'Pending Orders',
    updatedAt: 'Last updated:', //Última actualización:
    recentTitle: 'Recent Orders',
    status: 'Status',
  },

  // ─────────────────── NEW_ORDER ─────────────────────────

  // ───────────────────── ORDER ───────────────────────────
  order: {
    deposit: 'Deposit',
    subtotal: 'Subtotal',
    total: 'Total',
    shippingRequired: 'Shipping Required *',
  },

  // ───────────────────── USER ────────────────────────────
  user: {
    title: 'Create User',
    back: 'Back',
    name: 'Name',
    lastName: 'Last Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    employee: 'Employee',
    admin: 'Admin',
  },

  // ─────────────── SplitAction ──────────────────────
  splitAction: {
    new: '+ New',
    order: 'Order',
    user: 'User',
    glaze: 'Glaze',
  },

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
  // ─────────────── STATUS ──────────────────────
  status: { // First Capital for Status as Backend uses them like that
    New: 'New',
    Pending: 'Pending',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    InProgress: 'In Progress',
  },
}
