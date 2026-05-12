// Mock functions for task management (will be replaced with real API calls)

let mockTasks = [
  {
    id: 1,
    title: 'Согласовать текст согласия на обработку данных',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Определить сроки хранения данных (GDPR Art. 5)',
    completed: false,
    createdAt: new Date().toISOString()
  }
]

export const tasksMock = {
  // Get all tasks
  list: async () => {
    return [...mockTasks]
  },

  // Create a new task
  create: async (title) => {
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    }
    mockTasks.push(newTask)
    return newTask
  },

  // Update task (toggle completion)
  update: async (id, data) => {
    const taskIndex = mockTasks.findIndex(t => t.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...data }
    return mockTasks[taskIndex]
  },

  // Delete task
  delete: async (id) => {
    const taskIndex = mockTasks.findIndex(t => t.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }
    mockTasks.splice(taskIndex, 1)
    return { success: true }
  },

  // Mock function to simulate sending task to backend
  sendToBackend: async (task) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Task sent to backend:', task)
    return { success: true, task }
  }
}
