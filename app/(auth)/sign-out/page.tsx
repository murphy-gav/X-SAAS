import { redirect } from 'next/navigation';

export default function SignOutPage() {
  // This will call the server action and immediately redirect
  redirect('/api/auth/sign-out');
}