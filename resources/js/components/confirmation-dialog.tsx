import { XIcon, AlertTriangleIcon, LockIcon } from "lucide-react"
import { useState } from "react"
import H2 from "./ui/h2"
import { Input } from "./ui/input"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password?: string) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning"
  requirePassword?: boolean
  passwordPlaceholder?: string
  serverErrors?: {
    password?: string[]
  }
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  requirePassword = false,
  passwordPlaceholder = "Enter your password to confirm",
  serverErrors,
}: Props) => {
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    if (requirePassword && !password.trim()) {
      setPasswordError("Password is required")
      return
    }
    
    setPasswordError("")
    onConfirm(requirePassword ? password : undefined)
    // Don't auto-close here - let the parent component decide when to close
    // onClose()
    // setPassword("") // Don't reset password field here either
  }

  const handleClose = () => {
    setPassword("")
    setPasswordError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 transition-opacity" onClick={handleClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  variant === "danger" ? "bg-red-100" : "bg-yellow-100"
                }`}
              >
                <AlertTriangleIcon className={`w-6 h-6 ${variant === "danger" ? "text-red-600" : "text-yellow-600"}`} />
              </div>
              <H2>{title}</H2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: description }} />

            {/* Password Input */}
            {requirePassword && (
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <LockIcon className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Password Confirmation Required
                  </label>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordPlaceholder}
                  className={`w-full ${(passwordError || serverErrors?.password) ? 'border-red-500' : ''}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
                {serverErrors?.password && (
                  <p className="text-red-500 text-sm mt-1">{serverErrors.password[0]}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
