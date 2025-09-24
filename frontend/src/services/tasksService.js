import apiClient from '../lib/apiClient';

export const tasksService = {
  // Get all tasks for the current user
  async getUserTasks() {
    const { data, error } = await apiClient.get('/tasks');

    if (error) throw error;
    return data || [];
  },

  // Get upcoming tasks
  async getUpcomingTasks(days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await apiClient.get(`/tasks?upcoming=${days}`);

    if (error) throw error;
    return data || [];
  },

  // Get overdue tasks
  async getOverdueTasks() {
    const { data, error } = await apiClient.get('/tasks?overdue=true');

    if (error) throw error;
    return data || [];
  },

  // Get a specific task by ID
  async getTaskById(taskId) {
    const { data, error } = await apiClient.get(`/tasks/${taskId}`);

    if (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Create a new task
  async createTask(taskData) {
    const cleanTaskData = {
      title: taskData.title,
      description: taskData.description || null,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || null,
      contact_id: taskData.contact_id || null,
      deal_id: taskData.deal_id || null,
      assigned_to: taskData.assigned_to || null,
    };

    const { data, error } = await apiClient.post('/tasks', cleanTaskData);

    if (error) throw error;
    return data;
  },

  // Update a task
  async updateTask(taskId, updates) {
    const { data, error } = await apiClient.put(`/tasks/${taskId}`, updates);

    if (error) throw error;
    return data;
  },

  // Delete a task
  async deleteTask(taskId) {
    const { data, error } = await apiClient.delete(`/tasks/${taskId}`);

    if (error) throw error;
    return true;
  },

  // Get task statistics
  async getTaskStats() {
    const { data, error } = await apiClient.get('/tasks/stats');

    if (error) {
      // Fallback: calculate stats from all tasks
      const tasks = await this.getUserTasks();

      const stats = {
        total: tasks.length || 0,
        completed: tasks.filter(task => task.status === 'completed').length || 0,
        pending: tasks.filter(task => task.status === 'pending').length || 0,
        in_progress: tasks.filter(task => task.status === 'in_progress').length || 0,
        overdue: tasks.filter(task => {
          if (!task.due_date) return false;
          return new Date(task.due_date) < new Date() && task.status !== 'completed';
        }).length || 0,
        high_priority: tasks.filter(task => task.priority === 'high').length || 0,
      };

      return stats;
    }

    return data;
  },

  // Filter tasks
  async filterTasks(filters) {
    const params = new URLSearchParams();

    if (filters.status && filters.status.length > 0) {
      params.append('status', filters.status.join(','));
    }

    if (filters.priority && filters.priority.length > 0) {
      params.append('priority', filters.priority.join(','));
    }

    if (filters.assigned_to && filters.assigned_to.length > 0) {
      params.append('assigned_to', filters.assigned_to.join(','));
    }

    if (filters.dateRange) {
      params.append('date_start', filters.dateRange.start);
      params.append('date_end', filters.dateRange.end);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

    const { data, error } = await apiClient.get(endpoint);

    if (error) throw error;
    return data || [];
  },

  // Subscribe to task changes (placeholder for real-time updates)
  subscribeToTasks(callback) {
    // Since we don't have real-time updates, return a stub
    return {
      unsubscribe: () => {
        // Cleanup if needed
      }
    };
  },

  // Complete a task
  async completeTask(taskId) {
    return await this.updateTask(taskId, {
      status: 'completed'
    });
  }
};

export default tasksService;