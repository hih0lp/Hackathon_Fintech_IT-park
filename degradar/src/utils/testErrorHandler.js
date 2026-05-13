// Test file for error handling system
// This file can be used to test different error scenarios

import { handleApiError, handleSuccess, handleWarning, handleInfo } from './errorHandler.js'

// Test function to simulate different API errors
export const testErrorHandling = () => {
  console.log('Testing error handling system...')
  
  // Test 1: Login error
  const loginError = new Error('Неверный email или пароль')
  loginError.status = 401
  loginError.endpoint = '/users/login/'
  handleApiError(loginError, '/users/login/')
  
  // Test 2: Project not found
  setTimeout(() => {
    const projectError = new Error('Проект не найден')
    projectError.status = 404
    projectError.endpoint = '/projects/999/'
    handleApiError(projectError, '/projects/999/')
  }, 1000)
  
  // Test 3: Validation error with field errors
  setTimeout(() => {
    const validationError = new Error('Ошибка валидации')
    validationError.status = 400
    validationError.endpoint = '/users/register/'
    validationError.response = {
      data: {
        email: ['Email уже существует'],
        password: ['Пароль слишком короткий']
      }
    }
    handleApiError(validationError, '/users/register/')
  }, 2000)
  
  // Test 4: Success message
  setTimeout(() => {
    handleSuccess('Проект успешно создан!')
  }, 3000)
  
  // Test 5: Warning message
  setTimeout(() => {
    handleWarning('Файл слишком большой')
  }, 4000)
  
  // Test 6: Info message
  setTimeout(() => {
    handleInfo('Загрузка началась')
  }, 5000)
  
  // Test 7: Generic server error
  setTimeout(() => {
    const serverError = new Error('Internal Server Error')
    serverError.status = 500
    serverError.endpoint = '/unknown/endpoint/'
    handleApiError(serverError, '/unknown/endpoint/')
  }, 6000)
}

// Export for manual testing in browser console
if (typeof window !== 'undefined') {
  window.testErrorHandling = testErrorHandling
  console.log('Error handling test function available as window.testErrorHandling()')
}

export default testErrorHandling
