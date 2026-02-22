import { supabase } from './supabaseClient';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, users: data || [] };
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, users: [], error: error.message };
  }
};

// Get all tasks (admin only)
export const getAllTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles!tasks_user_id_fkey (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, tasks: data || [] };
  } catch (error) {
    console.error('Get all tasks error:', error);
    return { success: false, tasks: [], error: error.message };
  }
};

// Get all dhikr (admin only)
export const getAllDhikr = async () => {
  try {
    const { data, error } = await supabase
      .from('dhikr')
      .select(`
        *,
        profiles!dhikr_user_id_fkey (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, dhikrs: data || [] };
  } catch (error) {
    console.error('Get all dhikr error:', error);
    return { success: false, dhikrs: [], error: error.message };
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    // First delete from profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) throw profileError;

    // Then delete from auth.users (requires admin service role key)
    // This should be done on backend for security
    
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: error.message };
  }
};

// Get statistics (admin only)
export const getAdminStats = async () => {
  try {
    // Get user count
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, role', { count: 'exact' });
    
    if (usersError) throw usersError;

    // Get tasks count
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, completed', { count: 'exact' });
    
    if (tasksError) throw tasksError;

    // Get dhikr count
    const { data: dhikrs, error: dhikrError } = await supabase
      .from('dhikr')
      .select('id, count, target', { count: 'exact' });
    
    if (dhikrError) throw dhikrError;

    const totalUsers = users?.length || 0;
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const totalDhikr = dhikrs?.length || 0;
    const totalDhikrCount = dhikrs?.reduce((sum, d) => sum + d.count, 0) || 0;

    return {
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        completedTasks,
        totalDhikr,
        totalDhikrCount
      }
    };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return {
      success: false,
      stats: {
        totalUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalDhikr: 0,
        totalDhikrCount: 0
      },
      error: error.message
    };
  }
};
