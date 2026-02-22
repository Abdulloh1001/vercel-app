import { supabase } from './supabaseClient';

// Get all tasks for current user
export const getTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Get tasks error:', error);
    return { success: false, tasks: [], error: error.message };
  }
};

// Add new task
export const addTask = async (userId, taskName, goalValue, unit) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          task_name: taskName,
          goal_value: goalValue,
          unit: unit,
          actual_value: 0,
          completed: false,
          date: new Date().toISOString().split('T')[0]
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, task: data };
  } catch (error) {
    console.error('Add task error:', error);
    return { success: false, error: error.message };
  }
};

// Toggle task completion
export const toggleTask = async (taskId, completed) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: completed })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, task: data };
  } catch (error) {
    console.error('Toggle task error:', error);
    return { success: false, error: error.message };
  }
};

// Update task progress
export const updateTaskProgress = async (taskId, actualValue, goalValue) => {
  try {
    const completed = actualValue >= goalValue;
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        actual_value: actualValue,
        completed: completed 
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, task: data };
  } catch (error) {
    console.error('Update task progress error:', error);
    return { success: false, error: error.message };
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete task error:', error);
    return { success: false, error: error.message };
  }
};

// Get task statistics
export const getTaskStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('completed')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.length;
    const completed = data.filter(task => task.completed).length;

    return { success: true, total, completed };
  } catch (error) {
    console.error('Get task stats error:', error);
    return { success: false, total: 0, completed: 0 };
  }
};
