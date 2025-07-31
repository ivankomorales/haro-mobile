// locales/en.js
// Access these messages via the helper at utils/getMessage.js using dot notation keys

export const en = {
  errors: {
    user: {
      InvalidEmail: 'Invalid email format.',
      InvalidPhone: 'Phone number must be 10 digits.',
      NameRequired: 'User name is required.',
    },
    customer: {
      MissingName: 'Customer name is required.',
    },
    order: {
      CreateFailed: 'Something went wrong while creating the order.',
      DeliverDateBeforeCreation:
        'Delivery date cannot be earlier than order date.',
      MissingProduct: 'You must add at least one product before continuing.',
    },
    glaze: {
      FetchFailed: 'Could not load glazes. Please try again.',
    },
    image: {
      UploadFailed: 'Failed to upload images. Please try again.',
    },
  },

  success: {
    user: {
      Created: 'User created successfully.',
    },
    glaze: {
      Loaded: 'Glazes loaded successfully.',
      Added: 'Glaze added successfully.',
    },
    order: {
      Created: 'Order created successfully.',
    },
    product: {
      Added: 'Product added to order.',
    },
    image: {
      Uploaded: 'Images uploaded successfully.',
    },
  },

  labels: {
    general: {
      Name: 'Name',
      Email: 'Email',
      Phone: 'Phone',
      Notes: 'Notes',
    },
    order: {
      DeliveryDate: 'Delivery Date',
      Submit: 'Create Order',
      AddProduct: 'Add Product',
    },
  },

  confirm: {
    ExitFlowTitle: 'Cancel creation?',
    ExitFlowMessage: 'If you leave now, you will lose all unsaved changes.',
    ExitFlowConfirm: 'Yes, exit',
    ExitFlowCancel: 'No, stay',
  },

  formActions: {
    cancel: 'Cancel',
    submitDefault: 'Submit',
    confirmTitle: 'Cancel?',
    confirmMessage: 'You will lose unsaved changes if you exit now.',
    confirmText: 'Yes, exit',
    cancelText: 'No, stay',
  },

  formActionsUser: {
    cancel: 'Cancel',
    submitDefault: 'Create User',
    confirmTitle: 'Cancel creating user?',
    confirmMessage: 'All entered user data will be lost if you exit.',
    confirmText: 'Yes, changed my mind',
    cancelText: 'No, keep editing',
  },

  formActionsGlaze: {
    cancel: 'Cancel',
    submitDefault: 'Add Glaze',
    confirmTitle: 'Cancel glaze creation?',
    confirmMessage: 'You will lose the glaze configuration if you exit.',
    confirmText: 'Yes, discard glaze',
    cancelText: 'No, keep working',
  },

  formActionsOrder: {
    cancel: 'Cancel',
    submitDefault: 'Create Order',
    confirmTitle: 'Cancel this order?',
    confirmMessage: 'All progress in the order will be lost.',
    confirmText: 'Yes, cancel order',
    cancelText: 'No, go back',
  },

  auth: {
    EmailRequired: 'Email is required.',
    PasswordRequired: 'Password is required.',
    MissingFields: 'Please fill in all fields.',
    LoginFailed: 'Incorrect email or password.',
    ServerError: 'An unexpected error occurred. Please try again later.',
    LoggedOut: 'You have been logged out.',
  },

  loading: {
    image: 'Uploading image...',
    order: 'Creating order...',
    user: 'Registering user...',
    generic: 'Please wait...',
  },
  info: {
    welcome: 'Welcome to Haro Mobile!',
    logout: 'You have been logged out.',
  },
}
