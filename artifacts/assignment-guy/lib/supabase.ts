/**
 * Supabase client for the Expo mobile app.
 *
 * Uses EXPO_PUBLIC_ prefixed env vars only — these are bundled into the client
 * at build time. SUPABASE_SERVICE_ROLE_KEY is never imported here; it lives
 * exclusively in the API server.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// ---------------------------------------------------------------------------
// Chunked SecureStore adapter
// expo-secure-store has a ~2 KB per-key limit on some Android devices.
// Supabase JWTs can exceed this, so we split large values across multiple keys.
// ---------------------------------------------------------------------------
const CHUNK_SIZE = 1800;

const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const chunkCount = await SecureStore.getItemAsync(`${key}__chunks`);
    if (!chunkCount) {
      return SecureStore.getItemAsync(key);
    }
    const chunks: string[] = [];
    for (let i = 0; i < Number(chunkCount); i++) {
      const chunk = await SecureStore.getItemAsync(`${key}__chunk_${i}`);
      if (chunk === null) return null;
      chunks.push(chunk);
    }
    return chunks.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const total = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}__chunks`, String(total));
    for (let i = 0; i < total; i++) {
      await SecureStore.setItemAsync(
        `${key}__chunk_${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
  },

  async removeItem(key: string): Promise<void> {
    const chunkCount = await SecureStore.getItemAsync(`${key}__chunks`);
    if (chunkCount) {
      await SecureStore.deleteItemAsync(`${key}__chunks`);
      for (let i = 0; i < Number(chunkCount); i++) {
        await SecureStore.deleteItemAsync(`${key}__chunk_${i}`);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
