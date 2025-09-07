// src/components/OrderDetailsModal.jsx
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import OrderDetailsCard from './OrderDetailsCard'
import { getMessage as t } from '../utils/getMessage'
import { formatProductsWithLabels } from '../utils/transformProducts'

// Ensure images are safe-to-display strings
function imageToUrl(img) {
  if (!img) return null
  if (typeof img === 'string') return img
  if (img.url) return img.url
  if (img.secure_url) return img.secure_url
  return null
}

export default function OrderDetailsModal({ open, order, onClose, i18n, glazes }) {
  if (!order) return null

  // Prepare products for display: labels + image URLs
  const productsForDisplay = (order.products || []).map((p) => ({
    ...p,
    images: (p.images || []).map(imageToUrl).filter(Boolean),
  }))

  const formattedOrder = {
    ...order,
    products: formatProductsWithLabels(productsForDisplay, t, glazes),
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg dark:bg-neutral-900">
              <OrderDetailsCard
                order={formattedOrder}
                glazes={glazes}
                shippingRequired={t('order.shippingRequired')}
                subtotalLabel={t('order.subtotal')}
                advanceLabel={t('order.deposit')}
                totalLabel={t('order.total')}
                figureLabel={t('product.figure')}
                glazeLabel={t('glaze.title')}
                descriptionLabel={t('product.description')}
              />

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                >
                  {t('button.close')}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
