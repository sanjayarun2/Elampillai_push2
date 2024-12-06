import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // First check if settings exist
    const { data: existingSettings, error: checkError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', '1')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (!existingSettings) {
      // Call the RPC function to initialize settings
      const { error: initError } = await supabase.rpc('initialize_settings');
      
      if (initError) {
        console.error('Error initializing settings:', initError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}