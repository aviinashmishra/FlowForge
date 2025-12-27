import { SimpleAuthContainer } from '../../../components/auth/SimpleAuthContainer';
import { SimpleSignInForm } from '../../../components/auth/SimpleSignInForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

export default function SignInPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SimpleAuthContainer
        title="Welcome Back"
        subtitle="Sign in to your FlowForge account"
      >
        <SimpleSignInForm />
      </SimpleAuthContainer>
    </ProtectedRoute>
  );
}