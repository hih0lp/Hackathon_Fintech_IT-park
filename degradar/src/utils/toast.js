// Toast notification utility
export const showToast = (message, type = 'info', duration = 3000) => {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `
    document.body.appendChild(toastContainer)
  }

  const toast = document.createElement('div')
  toast.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    min-width: 250px;
    max-width: 400px;
  `

  // Set background color based on type
  switch (type) {
    case 'success':
      toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      break
    case 'error':
      toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      break
    case 'warning':
      toast.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      break
    default:
      toast.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  }

  toast.textContent = message
  toastContainer.appendChild(toast)

  // Add CSS animations if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)
}

export default showToast
