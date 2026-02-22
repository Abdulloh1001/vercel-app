import { supabase } from './supabaseClient';

// Get all dhikr for current user
export const getDhikrList = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('dhikr')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, dhikrs: data || [] };
  } catch (error) {
    console.error('Get dhikr error:', error);
    return { success: false, dhikrs: [], error: error.message };
  }
};

// Add new dhikr
export const addDhikr = async (userId, name, target, icon = '') => {
  try {
    const { data, error } = await supabase
      .from('dhikr')
      .insert([
        {
          user_id: userId,
          name: name,
          target: target,
          count: 0,
          icon: icon
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, dhikr: data };
  } catch (error) {
    console.error('Add dhikr error:', error);
    return { success: false, error: error.message };
  }
};

// Update dhikr count
export const updateDhikrCount = async (dhikrId, newCount) => {
  try {
    const { data, error } = await supabase
      .from('dhikr')
      .update({ count: newCount })
      .eq('id', dhikrId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, dhikr: data };
  } catch (error) {
    console.error('Update dhikr count error:', error);
    return { success: false, error: error.message };
  }
};

// Increment dhikr count
export const incrementDhikr = async (dhikrId, currentCount) => {
  return await updateDhikrCount(dhikrId, currentCount + 1);
};

// Add multiple counts to dhikr
export const addDhikrCounts = async (dhikrId, currentCount, addAmount) => {
  return await updateDhikrCount(dhikrId, currentCount + addAmount);
};

// Delete dhikr
export const deleteDhikr = async (dhikrId) => {
  try {
    const { error } = await supabase
      .from('dhikr')
      .delete()
      .eq('id', dhikrId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete dhikr error:', error);
    return { success: false, error: error.message };
  }
};

// Get dhikr statistics
export const getDhikrStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('dhikr')
      .select('count, target')
      .eq('user_id', userId);

    if (error) throw error;

    const totalCount = data.reduce((sum, dhikr) => sum + dhikr.count, 0);
    const totalTarget = data.reduce((sum, dhikr) => sum + dhikr.target, 0);

    return { success: true, totalCount, totalTarget };
  } catch (error) {
    console.error('Get dhikr stats error:', error);
    return { success: false, totalCount: 0, totalTarget: 0 };
  }
};
