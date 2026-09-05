import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dtjhyxifsgbaypahqngp.supabase.co";
const supabaseAnonKey = "sb_publishable_XSdZA9FT0fqrU0jTJ2eFzg_lR0rj1oi";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
