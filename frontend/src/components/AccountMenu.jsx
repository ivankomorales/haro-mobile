// src/components/AccountMenu.jsx
import { useEffect, useRef, useState } from 'react'
import { UserRoundPen, Settings, LogOut, Upload, X } from 'lucide-react'

function getInitials(nameOrEmail = '') {
  const base = nameOrEmail.includes('@')
    ? nameOrEmail.split('@')[0].replaceAll('.', ' ')
    : nameOrEmail
  const parts = base.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '??'
  const first = parts[0][0] || ''
  const second = parts[1]?.[0] || ''
  return (first + second).toUpperCase()
}

export default function AccountMenu({
  email = 'user@example.com',
  name = '',
  avatarUrl = '',
  onLogout, // required: function
  onUploadAvatar, // optional: async (file) => url
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || '')
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const fileInputRef = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Cerrar con ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Enfocar primer item al abrir
  const firstItemRef = useRef(null)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        firstItemRef.current?.focus()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [open])

  // Subida de avatar
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Preview local
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)

    // Si el padre provee onUploadAvatar, intenta subir
    if (onUploadAvatar) {
      try {
        const remoteUrl = await onUploadAvatar(file)
        if (remoteUrl) setPreviewUrl(remoteUrl)
      } catch (err) {
        console.error(err)
        // Si falla la subida, al menos dejamos el preview local
      }
    }
  }

  const avatarDisplay = previewUrl ? (
    <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" draggable={false} />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold dark:bg-neutral-700">
      {getInitials(name || email)}
    </div>
  )

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 overflow-hidden rounded-full focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-label="Account menu"
        title="Account"
      >
        {/* Mini avatar en el AppBar */}
        <div className="h-full w-full rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold">
              {getInitials(name || email)}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="absolute top-[calc(100%+8px)] right-0 z-50 w-72 rounded-lg border border-neutral-300 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900"
        >
          {/* Encabezado: email */}
          <div className="border-b border-neutral-200 px-2 py-2 text-sm dark:border-neutral-800">
            {/* <p className="truncate font-medium">{name || 'Tu cuenta'}</p> */}
            <div className="relative px-4 py-3 text-sm dark:border-neutral-800">
              {/* Botón cerrar en la esquina superior derecha */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-0 right-0 rounded p-0 text-neutral-500 hover:bg-gray-100 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Email centrado */}
              <p className="truncate text-center text-neutral-500 dark:text-neutral-400">{email}</p>
            </div>
          </div>

          {/* Avatar grande + botón subir */}
          <div className="relative mx-auto mt-4 h-20 w-20">
            {/* Círculo que SÍ recorta solo la imagen */}
            <div className="h-full w-full overflow-hidden rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {avatarDisplay}
            </div>

            {/* Botón subir, ahora encima y sin ser cortado */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -right-1 -bottom-1 z-10 rounded-full border bg-white p-1 shadow-md hover:bg-neutral-50 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              title="Subir foto"
              aria-label="Subir foto"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Menú */}
          <ul className="mt-4 space-y-1 px-2 pt-1 pb-3 text-sm">
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-gray-100 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:hover:bg-neutral-800"
                onClick={() => {
                  // TODO: navegar a /profile
                  setOpen(false)
                }}
              >
                <UserRoundPen className="h-4 w-4" aria-hidden="true" />
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-gray-100 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:hover:bg-neutral-800"
                onClick={() => {
                  // TODO: navegar a /settings
                  setOpen(false)
                }}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span>Settings</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:text-pink-600 dark:hover:bg-neutral-800"
                onClick={() => {
                  setOpen(false)
                  onLogout?.()
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Log out</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
