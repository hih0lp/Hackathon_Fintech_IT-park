// Global functions for voice commands and system-wide actions
import { showToast } from './toast.js'

// Initialize global functions
export const initializeGlobalFunctions = () => {
  // Toast notification system
  if (!window.showToast) {
    window.showToast = (message, type = 'info', duration = 3000) => {
      // Create toast element if it doesn't exist
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

    // Add CSS animations
    const style = document.createElement('style')
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

  // Navigation function
  if (!window.navigateTo) {
    window.navigateTo = (path) => {
      if (window.location.pathname !== path) {
        window.location.href = path
      } else {
        window.showToast('Вы уже на этой странице', 'info')
      }
    }
  }

  // Project creation modal function
  if (!window.openCreateProjectModal) {
    window.openCreateProjectModal = (projectName = '') => {
      // Try to find and click the create project button
      const createButton = document.querySelector('[data-testid="create-project-button"]') ||
                        document.querySelector('button:has(svg:contains("Создать новый проект"))') ||
                        document.querySelector('a[href="/projects"] button')
      
      if (createButton) {
        createButton.click()
        if (projectName) {
          setTimeout(() => {
            const titleInput = document.querySelector('input[id*="projectName"], input[placeholder*="проект"]')
            if (titleInput) {
              titleInput.value = projectName
              titleInput.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }, 500)
        }
        window.showToast('Открытие формы создания проекта...', 'info')
      } else {
        window.showToast('Не удалось найти кнопку создания проекта', 'error')
      }
    }
  }

  // Task creation modal function
  if (!window.openCreateTaskModal) {
    window.openCreateTaskModal = (taskName = '') => {
      // Try to find task creation interface
      const taskButton = document.querySelector('[data-testid="create-task-button"]') ||
                       document.querySelector('button:contains("Создать задачу")') ||
                       document.querySelector('.task-create-button')
      
      if (taskButton) {
        taskButton.click()
        if (taskName) {
          setTimeout(() => {
            const taskInput = document.querySelector('input[id*="task"], input[placeholder*="задачу"]')
            if (taskInput) {
              taskInput.value = taskName
              taskInput.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }, 500)
        }
        window.showToast('Открытие формы создания задачи...', 'info')
      } else {
        window.showToast('Функция создания задач недоступна на этой странице', 'warning')
      }
    }
  }

  // Voice commands help
  if (!window.showVoiceHelp) {
    window.showVoiceHelp = () => {
      const helpText = `
🎤 Голосовые команды:

📁 Управление проектами:
• "Создать проект" - открыть форму создания
• "Создать проект [название]" - создать с именем
• "Перейти к проектам" - перейти на страницу проектов

📋 Управление задачами:
• "Создать задачу" - открыть форму создания
• "Создать задачу [название]" - создать с именем

💬 Чат:
• "Отправить сообщение [текст]" - отправить в чат
• Любой текст без команды - отправить как сообщение

🔧 Навигация:
• "Главная" - перейти на главную
• "Помощь" - показать это меню

⏹️ Управление:
• "Стоп" - остановить запись голоса

Пример: "Создать проект Финтех-приложение"
      `
      
      window.showToast(helpText, 'info', 8000)
    }
  }

  console.log('Global functions initialized')
}

// Export for manual initialization
export default initializeGlobalFunctions
