import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { showSuccess, showError } from '../../utils/toastUtils'
import { getOrderById, updateOrderById } from '../../api/orders'
import { getMessage as t } from '../../utils/getMessage'
import { validateBaseForm, cleanAddresses } from '../../utils/orderBuilder'
import { useLayout } from '../../context/LayoutContext'
import FormInput from '../../components/FormInput'
import FormActions from '../../components/FormActions'
import FormAddress from '../../components/FormAddress'

export default function EditOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setTitle, setShowSplitButton } = useLayout()

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    countryCode: '+52',
    email: '',
    orderDate: '',
    deliverDate: '',
    deposit: '',
    shipping: { active: false, addresses: [] },
    socialMedia: { instagram: '', facebook: '' },
    status: 'New',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setTitle(t('order.editTitle'))
    setShowSplitButton(false)
    return () => {
      setTitle('Haro Mobile')
      setShowSplitButton(true)
    }
  }, [])

  useEffect(() => {
    async function fetchOrder() {
      try {
        const order = await getOrderById(id)
        setFormData({
          name: order.customer?.name || '',
          lastName: order.customer?.lastName || '',
          phone: order.customer?.phone || '',
          countryCode: order.customer?.countryCode || '+52',
          email: order.customer?.email || '',
          orderDate: order.orderDate?.slice(0, 10) || '',
          deliverDate: order.deliverDate?.slice(0, 10) || '',
          deposit: order.deposit || '',
          shipping: order.shipping || { active: false, addresses: [] },
          socialMedia: order.customer?.socialMedia || {
            instagram: '',
            facebook: '',
          },
          status: order.status || 'New',
          notes: order.notes || '',
        })
      } catch (err) {
        showError('error.loadingOrder')
        navigate('/orders')
      }
    }

    fetchOrder()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addOrUpdateSocial = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }))
  }

  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    setErrors({})

    const errs = validateBaseForm(formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showError('validation.requiredFields')
      if (errs.deliverDate) showError('validation.invalidDeliveryDate')
      if (errs.addresses) showError('validation.incompleteShipping')
      return
    }

    // ✅ Build payload in correct shape for backend
    const payload = {
      customer: {
        name: formData.name,
        lastName: formData.lastName,
        phone: formData.phone,
        countryCode: formData.countryCode,
        email: formData.email,
        socialMedia: formData.socialMedia,
      },
      orderDate: formData.orderDate,
      deliverDate: formData.deliverDate,
      deposit: formData.deposit,
      shipping: {
        ...formData.shipping,
        addresses: cleanAddresses(formData.shipping.addresses),
      },
      status: formData.status,
      notes: formData.notes,
    }

    try {
      await updateOrderById(id, formData)
      showSuccess('success.orderUpdated')
      navigate(`/orders/${id}`)
    } catch (err) {
      showError('error.updatingOrder')
    }
  }

  return (
    <form
      onSubmit={handleUpdateOrder}
      className="space-y-4 p-4 max-w-2xl mx-auto"
    >
      <FormInput
        name="name"
        label={t('form.name')}
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <FormInput
        name="lastName"
        label={t('form.lastName')}
        value={formData.lastName}
        onChange={handleChange}
        error={errors.lastName}
      />
      <FormInput
        name="email"
        label={t('form.email')}
        value={formData.email}
        onChange={handleChange}
      />
      <FormInput
        name="phone"
        label={t('form.phone')}
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      <FormInput
        type="date"
        name="orderDate"
        label={t('form.orderDate')}
        value={formData.orderDate}
        onChange={handleChange}
      />
      <FormInput
        type="date"
        name="deliverDate"
        label={t('form.deliverDate')}
        value={formData.deliverDate}
        onChange={handleChange}
        error={errors.deliverDate}
      />
      <FormInput
        name="deposit"
        label={t('form.deposit')}
        value={formData.deposit}
        onChange={handleChange}
      />
      <FormInput
        name="notes"
        label={t('form.notes')}
        value={formData.notes}
        onChange={handleChange}
        multiline
      />
      <FormInput
        name="status"
        label={t('form.status')}
        value={formData.status}
        onChange={handleChange}
        as="select"
      >
        <option value="New">{t('status.new')}</option>
        <option value="Pending">{t('status.pending')}</option>
        <option value="In Progress">{t('status.inProgress')}</option>
        <option value="Completed">{t('status.completed')}</option>
        <option value="Cancelled">{t('status.cancelled')}</option>
      </FormInput>

      <FormAddress
        active={formData.shipping.active}
        addresses={formData.shipping.addresses}
        onChange={(updated) =>
          setFormData((prev) => ({ ...prev, shipping: updated }))
        }
        error={errors.addresses}
      />

      <FormActions
        onSubmit={handleUpdateOrder}
        submitButtonText={t('formActions.saveChanges')}
        cancelButtonText={t('formActions.cancel')}
        confirmTitle={t('formActions.confirmTitle')}
        confirmMessage={t('formActions.confirmMessage')}
        confirmText={t('formActions.confirmText')}
        cancelText={t('formActions.cancelText')}
        cancelRedirect={`/orders/${id}`}
      />
    </form>
  )
}
