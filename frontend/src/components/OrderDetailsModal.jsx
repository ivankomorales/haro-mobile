import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'
import OrderDetailsCard from './OrderDetailsCard'
import { getMessage as t } from '../utils/getMessage'
import { formatProductsWithLabels } from '../utils/transformProducts'

export default function OrderDetailsModal({ open, order, onClose, i18n, glazes }) {
  if (!order) return null

  const formattedOrder = {
    ...order,
    products: formatProductsWithLabels(order.products, t, glazes),
  }
  console.log(order.products[0].glazes)
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
            <DialogPanel className="w-full max-w-3xl rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-lg overflow-y-auto max-h-[90vh]">
              {/* <DialogTitle className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {order.orderID ? `Order #${order.orderID}` : 'Order Details'}
              </DialogTitle> */}

              {/* Actual content */}
              <OrderDetailsCard
                order={formattedOrder}
                shippingRequired={t('order.shippingRequired')}
                subtotalLabel={t('order.subtotal')}
                advanceLabel={t('order.deposit')}
                totalLabel={t('order.total')}
                figureLabel={t('product.figure')}
                glazeLabel={t('glaze.title')}
                descriptionLabel={t('product.description')}
              />

              {/* Close button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
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
