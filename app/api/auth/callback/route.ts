/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createUserProfile } from '@/lib/actions/user.actions'; 

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return redirect("/login?error=auth")

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  const { data: userData, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !userData.user) {
    console.error('getUser after callback failed', getUserError);
    return redirect('/login?error=auth');
  }

  const { user } = userData;
  // You stored first/last name in metadata during signUp
  const firstName = (user.user_metadata as any)?.first_name || '';
  const lastName  = (user.user_metadata as any)?.last_name  || '';
  await createUserProfile(
    supabase,
    user.id,
    user.email!,
    { firstName, lastName }
  );
  
  // upsert profiles row…
  return redirect("/verify-success")
}