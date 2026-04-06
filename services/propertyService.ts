import { supabase } from '@/services/supabase';
import { Property } from '@/types';

/** Fetch all properties for a user, newest first */
export async function fetchProperties(userId: string): Promise<Property[]> {
  const { data } = await supabase
    .from('properties')
    .select('id, name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

/** Create a new property for the current authenticated user */
export async function createProperty(name: string): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('properties')
    .insert([{ name: name.trim(), user_id: userId }]);
  if (error) throw error;
}

/** Rename a property */
export async function renameProperty(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ name: name.trim() })
    .eq('id', id);
  if (error) throw error;
}

/** Delete one or more properties by ID */
export async function deleteProperties(ids: string[]): Promise<void> {
  const { error } = await supabase.from('properties').delete().in('id', ids);
  if (error) throw error;
}
