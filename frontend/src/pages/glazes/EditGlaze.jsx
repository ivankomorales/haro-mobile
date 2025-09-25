// src/pages/glazes/EditGlaze.jsx
// comments in English only
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

import { getGlazeById, updateGlaze } from '../../api/glazes'
import FormActions from '../../components/FormActions'
import FormInput from '../../components/FormInput'
import ImageUploader from '../../components/ImageUploader'
import { useLayout } from '../../context/LayoutContext'
import { getMessage as t } from '../../utils/getMessage'
import { useI18n } from '../../context/I18nContext'
import { getOriginPath } from '../../utils/navigationUtils'
import { showLoading, showSuccess, showError, dismissToast } from '../../utils/toastUtils'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import { useAuthedFetch } from '../../hooks/useAuthedFetch' // ⬅️ NEW

export default function EditGlaze() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const originPath = getOriginPath(
    location.state?.originPath ?? location.state?.from,
    '/products/glazes'
  )

  const { setTitle, setShowSplitButton, resetLayout } = useLayout()
  const authedFetch = useAuthedFetch() // ⬅️ NEW

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState('')

  // form state
  const [formData, setFormData] = useState({
    name: '',
    hex: '#000000',
    code: '',
    newImages: [], // local files to replace current image on save
  })

  // dirty-check baseline
  const [initial, setInitial] = useState(null)

  // 1) Layout effect — run once
  const { t, locale } = useI18n()
  useEffect(() => {
    setTitle(`${t('glaze.title')} — ${t('common.edit')}`)
    setShowSplitButton(false)
    return resetLayout
    // We intentionally run this once to avoid re-fetch loops due to context fn identities
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTitle, setShowSplitButton, resetLayout, locale])

  // 2) Data effect — only depends on id and stable authedFetch
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const g = await getGlazeById(id, { fetcher: authedFetch })
        if (!mounted) return
        const base = {
          name: g?.name || '',
          hex: (g?.hex || '#000000').toLowerCase(),
          code: g?.code || '',
        }
        setInitial(base)
        setFormData({ name: base.name, hex: base.hex, code: base.code, newImages: [] })
        setCurrentImage(g?.image || '')
      } catch (e) {
        if (mounted) setError(e.message || 'Failed to load glaze')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id, authedFetch])

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }))
    setError(null)
  }

  const normHex = (h) =>
    String(h || '')
      .trim()
      .toLowerCase()

  const isDirty = useMemo(() => {
    if (!initial) return false
    const changedFields =
      (formData.name || '') !== (initial.name || '') ||
      normHex(formData.hex) !== normHex(initial.hex) ||
      (formData.code || '') !== (initial.code || '')
    const hasNewImage = (formData.newImages?.length || 0) > 0
    return changedFields || hasNewImage
  }, [initial, formData.name, formData.hex, formData.code, formData.newImages])

  const isSubmitDisabled = !isDirty || saving || !(formData.name || '').trim()

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!isDirty || saving) return

    setSaving(true)
    setError(null)

    const toastId = showLoading('glaze.updating')
    try {
      let nextImage = currentImage
      if (formData.newImages && formData.newImages.length > 0) {
        const [first] = formData.newImages
        nextImage = await uploadToCloudinary(first, 'haromobile/glazes')
      }

      const payload = {
        name: formData.name.trim(),
        colorHex: formData.hex, // controller maps colorHex -> hex
        code: formData.code.trim(),
        image: nextImage || '',
      }

      // ⬇️ pass { fetcher } instead of { navigate }
      await updateGlaze(id, payload, { fetcher: authedFetch })
      showSuccess('success.glaze.updated')

      navigate(returnTo || originPath || '/products/glazes', { replace: true })
    } catch (err) {
      console.error(err)
      const key = err?.message?.startsWith?.('auth.') ? err.message : 'glaze.updateFailed'
      showError(key)
      setError(err.message || 'Error updating glaze')
    } finally {
      dismissToast(toastId)
      setSaving(false)
    }
  }

  if (loading) return <div className="p-4">Loading glaze…</div>

  return (
    <div className="h-full min-h-0 bg-white px-4 font-sans text-gray-800 dark:bg-neutral-900 dark:text-gray-100">
      <div className="pt-2 pb-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
          <div className="flex items-center gap-4">
            <FormInput
              label={t('glaze.name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <FormInput
              label={t('glaze.code')}
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={saving}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="hex"
                value={formData.hex}
                onChange={handleChange}
                disabled={saving}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-700 dark:text-gray-300">{formData.hex}</span>
            </div>
          </div>

          {/* Current image preview + drop zone */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Image</div>

            <div className="flex items-center gap-3">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={formData.name}
                  className="h-32 w-32 rounded-md border object-cover"
                />
              ) : (
                <div
                  className="h-32 w-32 rounded-md border"
                  style={{ background: formData.hex }}
                  title={formData.hex}
                />
              )}
            </div>

            <ImageUploader
              multiple={false}
              disabled={saving}
              value={formData.newImages}
              onChange={(imgs) => setFormData((s) => ({ ...s, newImages: imgs }))}
            />

            <div className="text-xs text-neutral-500">
              {formData.newImages?.length
                ? 'A new image will replace the current one on save.'
                : currentImage
                  ? 'Leave empty to keep current image.'
                  : 'No current image. You can upload one.'}
            </div>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <FormActions
            onSubmit={handleSubmit} // ensure button is type="submit" to avoid double call
            submitText={saving ? 'Saving…' : undefined}
            submitDisabled={isSubmitDisabled}
            cancelRedirect={returnTo || originPath || '/products/glazes'}
            submitButtonText="Update"
          />
        </form>
      </div>
    </div>
  )
}
