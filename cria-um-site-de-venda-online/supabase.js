const SUPABASE_URL = "https://rqfedqftxhhutyymhzed.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZmVkcWZ0eGhodXR5eW1oemVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzQ4NzAsImV4cCI6MjA5NzQ1MDg3MH0.76ZL2wKiuAMIXMXYvKoUrGT2yPnvoNM2Ebg94icwgUM";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
