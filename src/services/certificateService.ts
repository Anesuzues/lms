import { supabase } from '@/lib/supabase';

export interface CertificateRecord {
  id: string;
  user_id: string;
  user_name: string;
  course_name: string;
  completed_at: string | null;
  issued_at: string;
}

export async function saveCertificate(
  userId: string,
  userName: string,
  courseName: string,
  completedAt: string | null,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('certificates')
    .insert({ user_id: userId, user_name: userName, course_name: courseName, completed_at: completedAt })
    .select('id')
    .single();

  if (error) {
    console.error('saveCertificate error:', error);
    return null;
  }
  return data.id as string;
}

export async function getCertificateById(uuid: string): Promise<CertificateRecord | null> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', uuid)
    .maybeSingle();

  if (error || !data) return null;
  return data as CertificateRecord;
}
