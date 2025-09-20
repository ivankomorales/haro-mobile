// locales/en.js
// Access these messages via utils/getMessage.js using dot notation keys

export const en = {
  app: {
    name: 'Haro Mobile',
  },

  nav: {
    main: 'Main',
    home: 'Home',
    orders: 'Orders',
    users: 'Users',
    catalog: 'Catalog',
    products: 'Products',
    // glazes: usa glaze.list existente
  },
  // ─── ERRORS & VALIDATION ──────────────────────────────── (KEEP THESE)
  errors: {
    zip: { mx5digits: 'El CP debe tener 5 dígitos' },
    user: { invalidPhone: 'El teléfono debe tener 10 dígitos' },
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
      deliverDateBeforeCreation: 'Delivery date cannot be earlier than order date.',
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
      priceInvalid: 'Invalid price.',
      addFailed: 'Failed to add product.',
      figuresRequired: 'Figures must be at least 1.',
      discountInvalid: 'Discount cannot exceed price.',
      priceInvalid: 'Price must be greater than 0.',
      typeRequired: 'Product type is required.',
    },
  },

  validation: {
    address: 'Address is required.',
    street: 'Street is required',
    state: 'State is required',
    country: 'Country is required',
    city: 'City is required',
    zip: 'ZIP code is required',
    phone: 'Phone is required',

    facebookFormat: 'Facebook username must start with "/"',
    incompleteAddressBeforeAdding: 'Complete the current address before adding another one.',
    incompleteShipping: 'Please complete all shipping address fields before adding a new one.',
    instagramFormat: 'Instagram handle must start with "@"',
    nameOnlyLetters: 'First name can only contain letters.',
    lastNameOnlyLetters: 'Last name can only contain letters.',
    invalidDeliveryDate: 'The delivery date must be after the order date.',

    positiveNumber: 'Value must be greater than 0',
    requiredFields: 'Please fill all required fields.',
  },

  // ─── SUCCESS ─────────────────────────────────────────────
  success: {
    glaze: {
      added: 'Glaze added successfully.',
      loaded: 'Glazes loaded successfully.',
      updated: 'Glaze updated successfully.',
    },
    image: {
      uploaded: 'Images uploaded successfully!',
    },
    order: {
      baseCreated: 'Base order (draft) created.',
      created: 'Order created successfully.',
      socialAdded: 'Social media added',
      updated: 'Order Updated!',
      cancelled: 'Order Cancelled',
    },
    product: {
      added: 'Product added successfully!',
      updated: 'Product updated!',
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
    networkError: 'Network error. Please check your connection.',
    //OLD ONES
    emailRequired: 'Email is required.',
    missingFields: 'Please fill in all fields.',
    passwordRequired: 'Password is required.',
  },

  // COMPONENTS
  //BOTTOM NAV BAR
  navBar: {
    home: 'Home',
    orders: 'Orders',
    newOrder: 'New Order',
    glazes: 'Glazes',
    profile: 'Profile',
  },
  //  ─────────────────────────── PAGES  ───────────────────────────
  // GLAZES
  glaze: {
    title: 'Glaze',
    name: 'Glaze Name',
    code: 'Code (optional)',
    new: 'New glaze', // ← NEW (actualizado)
    list: 'Glazes', // ← NEW
    updating: 'Updating glaze...',
    updateFailed: 'Failed to update glaze.',

    loading: 'Loading glazes...', // ← NEW
    empty: 'No glazes', // ← NEW
    searchPlaceholder: 'Search by name, code, hex…', // ← NEW

    noCode: 'No code', // ← NEW
    hex: 'Hex', // ← NEW
    noHex: 'No hex', // ← NEW

    confirm: {
      activate: {
        title: 'Activate glaze?', // ← NEW
        message: 'This glaze will be marked as active and available for selection.', // ← NEW
        confirm: 'Yes, activate', // ← NEW
      },
      deactivate: {
        title: 'Deactivate glaze?', // ← NEW
        message: 'This glaze will be marked as inactive and hidden from selection.', // ← NEW
        confirm: 'Yes, deactivate', // ← NEW
      },
    },
  },

  // USERS
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

  // ───────────────────── HOME ───────────────────────────
  home: {
    title: 'Home',
    pendingTitle: 'Pending Orders',
    updatedAt: 'Last updated:',
    recentTitle: 'Recent Orders',
    status: 'Status',
    loading: 'Loading',
  },

  // ───────────────────── ORDERS ───────────────────────────
  order: {
    title: 'Orders',
    label: 'Order',
    // ─── Customer Info ──────────────────────────────────────────
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
    submit: 'Confirm',
    editCustomer: 'Edit Customer',
    remove: 'Remove',
    newTitle: 'New Order',
    editTitle: 'Edit Order',
    addProduct: 'Add product',

    status: 'Order Status',

    notes: 'Notes',
    datePlaceholder: 'DD/MM/YYYY',

    search: 'Name, email, orderID',
    details: 'Order Details',

    exportingPDF: 'Generating PDF...',
    exportingXLS: 'Exporting to Excel...',
    noneSelected: 'You have not selected any orders.',
    exportError: 'Failed to export orders.',
    exportExcelPending: 'Excel export not available yet.',
    exportWordPending: 'Word export not available yet.',

    updatingStatus: 'Updating status...',
    statusUpdated: 'Statuses updated successfully.',
    updateError: 'Failed to update status.',
    empty: 'No orders found',
    loading: 'Loading Orders',

    entries: 'entries',
    add: 'Add new',

    all: 'All Orders',
    // ─── Sections ──────────────────────────────────────────
    section: {
      customerInfo: 'Customer Info',
      customerInfoHint: 'Basic customer details and social information.',
      orderInfo: 'Order Info',
      orderInfoHint: 'Dates, status, payment and shipping preferences.',
      orderSummary: 'Order Summary',
    },

    // ─── Shipping ──────────────────────────────────────────
    shippingHint: 'Enable to add one or more shipping addresses.',
    shippingEmptyTitle: 'No addresses yet',
    shippingEmptyHint: 'Add at least one shipping address if delivery is required.',
    shippingRequired: 'Requires shipping',
    shippingAddress: 'Shipping address',
    addAddress: '+ Add Address',
    address: 'Address',
    street: 'Street',
    city: 'City',
    state: 'State',
    zip: 'ZIP code',
    country: 'Country',
    phoneShipping: 'Phone (shipping)',
    reference: 'Reference',

    // ─── Dates (if not already defined) ────────────────────
    orderDate: 'Order date',
    deliveryDate: 'Delivery date',

    // ─── Country code selector ─────────────────────────────
    countryCode: 'Country code',
  },

  // AddProduct
  product: {
    title: 'Add Product',
    edit: 'Edit Product',
    type: 'Type',
    select: 'Select a Product',
    description: 'Description',
    product: 'Item',
    qty: 'Quantity',
    price: 'Price',
    pricePrefix: '$',
    discount: 'Discount',
    added: 'Product added',
    addedOther: 'Products Added',

    glazeTitle: 'Glaze',
    glazeInt: 'Interior',
    glazeExt: 'Exterior',
    glazeSearch: 'Search Glaze',
    glazeNone: 'No Glaze',
    glazeNoResult: 'No Results',

    images: 'Images',

    addButton: 'Add Product',

    figure: 'Figure',
    cup: 'Cup',
    handmadeCup: 'Handmade Cup',
    plate: 'Plate',
    figurine: 'Figurine',
    //Section
    section: {
      customerInfo: 'Customer Info',
      productInfo: 'Product Info',
      productInfoHint: 'Select the type, quantity, and price.',
      productDetails: 'Product Details',
      productDetailsHint: 'Adjust figure count, glazes, and personalization.',
    },
    figuresCountLabel: 'No. of Figures:',
    glazes: 'Glazes',
    decorations: 'Decorations & Personalization',
    hasGoldHint: 'Applied on edges and details.',
    hasNameHint: 'Add a short name to the piece.',
    hasGold: 'Gold Details',
    hasName: 'Personalized Name',
  },

  cart: {
    empty: 'No products added yet.',
    subtotal: 'Subtotal',
    orderSummary: 'Order Summary',
    payment: 'Payment',
    balance: 'Balance',
    deposit: 'Deposit',
    discounts: 'Discounts',
    total: 'Total',
  },
  // ─────────────── SplitAction ──────────────────────
  splitAction: {
    new: 'New',
    order: 'Order',
    user: 'User',
    glaze: 'Glaze',
  },

  // ─────────────── STATUS ──────────────────────
  status: {
    label: 'Status',
    all: 'All',
    new: 'New',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    unknown: 'Unknown',
    active: 'Active', // ← NEW
    inactive: 'Inactive', // ← NEW
  },

  // FORM ACTIONS
  formActions: {
    saveChanges: 'Save changes',
    cancel: 'Cancel',
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

  // BUTTONS / ACTIONS
  button: {
    confirm: 'Confirm',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    cancelEdit: 'Cancel Edit',
    ok: 'OK',
    search: 'Search',
    close: 'Close',

    addProduct: 'Add Product',
    addGlaze: 'Add Glaze',
    back: 'Back',

    login: 'Log in',

    clear: 'Clear',
    apply: 'Apply',

    edit: 'Edit', // ← NEW
    activate: 'Activate', // ← NEW
    deactivate: 'Deactivate', // ← NEW
    exportPdf: 'Export PDF', // ← NEW
    exportExcel: 'Export Excel', // ← NEW
    changeStatus: 'Change Status', // ← NEW
    checkout: 'Checkout', // ← NEW
  },

  messages: {
    selectAtLeastOneOrder: 'Select at least 1 order',
  },

  sort: {
    by: 'Sort by', // ← NEW
  },

  // ARIA
  aria: {
    editProduct: 'Edit product',
    removeProduct: 'Remove product',
  },

  // COMMONS
  common: {
    cancel: 'Cancel', // ← NEW
    working: 'Working…', // ← NEW
    na: 'N/A', // ← NEW
    delete: 'Delete',
  },

  // pagination
  pagination: {
    previous: 'Previous',
    next: 'Next',
    rowsPerPage: 'Rows/page',
    of: 'of',
  },

  // chips (includes tabs)
  chip: {
    remove: 'Remove',
    removeAll: 'Remove All',
    active: 'Active', // ← NEW
    inactive: 'Inactive', // ← NEW
    all: 'All', // ← NEW
  },
  // ─── TABLE HEADERS (unified) ─────────────────────────────
  headers: {
    // Glazes & general
    image: 'Image',
    name: 'Name',
    code: 'Code',
    hex: 'Hex',
    status: 'Status',
    actions: 'Actions',

    // Orders-specific
    orderID: 'ORD#',
    customer: 'Customer',
    orderDate: 'Order date',
    total: 'Total',
  },
  filters: {
    title: 'Filters',
  },
  labels: {
    from: 'From',
    to: 'To',
    urgent: 'Urgent',
    shippingRequired: 'Shipping Required',
    ignore: 'Ignore',
    yes: 'Yes',
    no: 'No',
    orderLoading: 'Loading Orders...',
    orderLoadingError: 'Error Loading Orders',
  },

  // ─── STATS ───────────────────────────
  stats: {
    thisMonth: 'This Month',
    pending: 'Pending',
    completed: 'Completed',
    // ── NEW ──
    inProgress: 'In Progress',
    cancelled: 'Cancelled',
    inRange: 'Orders (range)',
    netSales: 'Net sales',

    grossMinusDeposit: 'Gross − Deposit',
    range: 'Range',
    week: 'Last 7 days',
    '15d': 'Last 15 days',
    '30d': 'Last 30 days',
    month: 'This month',
    quarter: 'This quarter',
    year: 'This year',
    all: 'All time',
    total: 'Total', // optional
  },

  // STATUSMODAL
  statusModal: {
    title: 'Change status',
    subtitle: 'Select the new status',
  },

  //EXCELMODAL
  exportModal: {
    title: 'Export to Excel / CSV',
    searchPlaceholder: 'Search fields…',
    selectAll: 'Select all',
    clear: 'Clear',
    savePrefs: 'Save preference',
    prefsSaved: 'Preferences saved',
    prefsSaveError: 'Could not save preferences ❌',
    export: 'Export',
    exportStarted: 'Export started!',
    noResults: 'No fields match your search.',
    selectedCount: 'Selected:', // <-- importante: incluye {{n}}
  },

  fields: {
    orderID: 'Order ID',
    customerName: 'Customer name',
    customerPhone: 'Customer phone',
    customerEmail: 'Customer email',
    status: 'Status',
    isUrgent: 'Urgent?',
    orderDate: 'Date',
    deliverDate: 'Delivery date',
    notes: 'Notes',
    productIndex: 'Product index',
    productType: 'Product type',
    productDescription: 'Product description',
    glazeInteriorName: 'Interior glaze',
    glazeInteriorHex: 'Interior glaze (hex)',
    glazeExteriorName: 'Exterior glaze',
    glazeExteriorHex: 'Exterior glaze (hex)',
  },
  login: {
    email: 'Email',
    password: 'Password',
  },
  confirm: {
    cancelOrder: {
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
    },
  },
  loading: {
    image: 'Loading Images...',
    orderCreate: 'Creating Order',
  },
  invoice: {
    product: 'Product',
    qty: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
  },
}
