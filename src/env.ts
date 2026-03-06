export const environment = {
  supabase: {
    url: (window as any).SUPABASE_URL || 'https://iklsdkexrmxfliatmiho.supabase.co',
    key: (window as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHNka2V4cm14ZmxpYXRtaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTM3NjYsImV4cCI6MjA4MzE4OTc2Nn0.5xGzIcjj7pxYAQe5whCsvU94v7IkqEn_PJp471PKTqc',
  },
  gemini: {
    apiKey: (window as any).GEMINI_API_KEY || 'AIzaSyAu8iFsx--QLX8E9X21j7MFsINzDAuOuuM'
  }
};