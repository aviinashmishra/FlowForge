import { SimpleAuthContainer } from '../../../components/auth/SimpleAuthContainer';
import { ForgotPasswordForm } from '../../../components/auth/ForgotPasswordForm';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';

export default function ForgotPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SimpleAuthContainer
        title="Reset Password"
        subtitle="Enter your email to receive a password reset link"
      >
        <ForgotPasswordForm />
      </SimpleAuthContainer>
    </ProtectedRoute>
  );
}