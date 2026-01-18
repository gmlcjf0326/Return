import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다. ' +
    '.env.local 파일에 Supabase URL을 추가하세요.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다. ' +
    '.env.local 파일에 Supabase Anon Key를 추가하세요.'
  );
}

// 클라이언트 사이드용 Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드용 Supabase 클라이언트 (Service Role Key 사용)
let serverClient: SupabaseClient | null = null;

export const createServerSupabaseClient = () => {
  if (serverClient) return serverClient;

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다. ' +
      '서버 사이드 기능이 제한될 수 있습니다.'
    );
    // Service Key가 없으면 anon key로 fallback
    serverClient = supabase;
    return serverClient;
  }

  serverClient = createClient(supabaseUrl, supabaseServiceKey);
  return serverClient;
};

export default supabase;
