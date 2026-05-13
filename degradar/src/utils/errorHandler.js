import { showToast } from './toast.js'

// Russian error messages for HTTP status codes
const HTTP_ERROR_MESSAGES = {
  400: 'Ошибка валидации. Проверьте правильность введенных данных',
  401: 'Требуется авторизация. Войдите в систему',
  403: 'Нет доступа к этому ресурсу',
  404: 'Запрошенный ресурс не найден',
  405: 'Метод не разрешен',
  406: 'Неприемлемый формат данных',
  409: 'Конфликт данных. Возможно, ресурс уже существует',
  410: 'Ресурс больше не доступен',
  413: 'Слишком большой размер файла',
  415: 'Неподдерживаемый формат файла',
  422: 'Ошибка обработки данных',
  429: 'Слишком много запросов. Попробуйте позже',
  500: 'Внутренняя ошибка сервера',
  502: 'Сервер временно недоступен',
  503: 'Сервис временно недоступен',
  504: 'Время ожидания истекло',
}

// Specific error messages for API endpoints based on Swagger documentation
const ENDPOINT_ERROR_MESSAGES = {
  // Auth endpoints
  '/users/login/': {
    401: 'Неверный email или пароль',
    400: 'Заполните все обязательные поля',
  },
  '/users/register/': {
    400: 'Ошибка валидации. Проверьте правильность email и пароля',
  },
  '/users/verify-code/': {
    400: 'Код истёк, неверный код или email уже подтверждён',
    404: 'Пользователь не найден',
  },
  '/users/resend-code/': {
    400: 'Email уже подтверждён',
    404: 'Пользователь не найден',
  },
  '/users/token/refresh/': {
    401: 'Срок действия токена истёк. Войдите заново',
  },

  // Projects endpoints
  '/projects/': {
    400: 'Ошибка валидации данных проекта',
    403: 'Нет прав на создание проекта',
  },
  '/projects/{id}/': {
    403: 'Нет прав на редактирование проекта',
    404: 'Проект не найден',
    400: 'Ошибка валидации данных проекта',
  },
  '/projects/{project_id}/upload/': {
    400: 'Ошибка загрузки файлов. Проверьте формат и размер',
    404: 'Проект не найден',
    403: 'Нет прав на загрузку файлов',
  },
  '/projects/files/{file_id}/': {
    403: 'Нет прав на удаление файла',
    404: 'Файл не найден',
  },

  // Chats endpoints
  '/chats/': {
    400: 'Ошибка валидации данных чата',
  },
  '/chats/{chat_id}/ask/': {
    400: 'Отсутствует текст сообщения',
    403: 'Нет доступа к чату',
    404: 'Чат не найден',
  },
  '/chats/{chat_id}/ask/{request_id}/': {
    403: 'Нет доступа к запросу',
    404: 'Запрос или чат не найден',
  },
  '/chats/{chat_id}/messages/': {
    403: 'Нет доступа к сообщениям чата',
    404: 'Чат не найден',
  },
  '/chats/{id}/': {
    403: 'Нет прав на удаление чата',
    404: 'Чат не найден',
  },
  '/chats/chats/{chat_id}/new-version/': {
    400: 'Превышен лимит версий чата',
    404: 'Чат не найден',
  },

  // Tasks endpoints
  '/tasks/create/': {
    400: 'Ошибка валидации данных задач',
  },
  '/tasks/{id}/': {
    400: 'Ошибка валидации данных задачи',
    403: 'Нет прав на редактирование задачи',
    404: 'Задача не найдена',
  },
  '/tasks/duplicate-to-yougile/': {
    400: 'Ошибка валидации или синхронизации с YouGile',
    403: 'Нет доступа к задачам',
  },

  // Agents endpoints
  '/agents/{id}/': {
    404: 'Агент не найден',
    403: 'Нет прав на редактирование агента',
  },

  // YouGile endpoints
  '/users/yougile/auth/': {
    400: 'Ошибка аутентификации в YouGile. Проверьте данные',
    401: 'Неверные данные для входа в YouGile',
  },
}

// Function to normalize endpoint path for matching
const normalizeEndpoint = (endpoint) => {
  // Replace path parameters with {id} pattern
  return endpoint
    .replace(/\/\d+/g, '/{id}')
    .replace(/\/chats\/\d+/g, '/chats/{chat_id}')
    .replace(/\/projects\/\d+/g, '/projects/{project_id}')
    .replace(/\/files\/\d+/g, '/files/{file_id}')
    .replace(/\/ask\/\d+/g, '/ask/{request_id}')
}

// Function to get specific error message for endpoint
const getEndpointErrorMessage = (endpoint, status, originalError) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const endpointErrors = ENDPOINT_ERROR_MESSAGES[normalizedEndpoint]
  
  if (endpointErrors && endpointErrors[status]) {
    return endpointErrors[status]
  }
  
  // Try to extract field-specific errors from the response
  if (originalError && typeof originalError === 'object') {
    const fieldErrors = Object.entries(originalError)
      .filter(([key]) => key !== 'detail' && key !== 'message')
      .map(([field, messages]) => {
        const fieldName = getFieldDisplayName(field)
        if (Array.isArray(messages)) {
          return `${fieldName}: ${messages.join(', ')}`
        }
        return `${fieldName}: ${messages}`
      })
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('; ')
    }
  }
  
  // Return generic error message for status code
  return HTTP_ERROR_MESSAGES[status] || `Произошла ошибка (${status})`
}

// Function to get user-friendly field names
const getFieldDisplayName = (field) => {
  const fieldNames = {
    email: 'Email',
    password: 'Пароль',
    password2: 'Подтверждение пароля',
    title: 'Название',
    description: 'Описание',
    country: 'Страна',
    msg: 'Сообщение',
    project_id: 'ID проекта',
    chat_id: 'ID чата',
    file: 'Файл',
    files: 'Файлы',
    name: 'Название',
    login: 'Логин',
    companyId: 'ID компании',
  }
  
  return fieldNames[field] || field
}

// Main error handler function
export const handleApiError = (error, endpoint = '') => {
  let status = null
  let originalError = null
  
  if (error.response) {
    // Error from response
    status = error.response.status
    originalError = error.response.data
  } else if (error.status) {
    // Error with status property
    status = error.status
  } else if (error.message && error.message.includes('HTTP')) {
    // Extract status from error message
    const match = error.message.match(/HTTP (\d+)/)
    if (match) {
      status = parseInt(match[1])
    }
  }
  
  // Get appropriate error message
  const errorMessage = getEndpointErrorMessage(endpoint, status, originalError)
  
  // Show toast notification
  showToast(errorMessage, 'error')
  
  // Return formatted error for further handling
  return {
    message: errorMessage,
    status,
    endpoint,
    originalError
  }
}

// Function to handle success messages
export const handleSuccess = (message, duration = 3000) => {
  showToast(message, 'success', duration)
}

// Function to handle warning messages
export const handleWarning = (message, duration = 3000) => {
  showToast(message, 'warning', duration)
}

// Function to handle info messages
export const handleInfo = (message, duration = 3000) => {
  showToast(message, 'info', duration)
}

export default {
  handleApiError,
  handleSuccess,
  handleWarning,
  handleInfo
}
