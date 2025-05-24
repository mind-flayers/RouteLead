import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnsaibersyxpedauhwfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuc2FpYmVyc3l4cGVkYXVod2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjExMDgsImV4cCI6MjA2MzYzNzEwOH0.sUYQrB5mZfeWhoMkbvvquzM9CdrOLEVFpF0yEnE2yZQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 