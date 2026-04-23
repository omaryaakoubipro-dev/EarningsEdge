import AuthForm from '@/components/auth/AuthForm';

export const metadata = { title: 'Sign In — EarningsEdge' };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
