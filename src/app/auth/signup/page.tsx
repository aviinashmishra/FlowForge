import { SimpleAuthContainer } from '../../../components/auth/SimpleAuthContainer';
import { SimpleSignUpForm } from '../../../components/auth/SimpleSignUpForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

export default function SignUpPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SimpleAuthContainer
        title="Join FlowForge"
        subtitle="Create your account and start building amazing workflows"
      >
        <SimpleSignUpForm />
      </SimpleAuthContainer>
    </ProtectedRoute>
  );
}