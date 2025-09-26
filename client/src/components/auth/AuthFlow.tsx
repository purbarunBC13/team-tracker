import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

export const AuthFlow: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  if (isRegistering) {
    return <RegisterPage onSwitchToLogin={() => setIsRegistering(false)} />;
  }

  return <LoginPage onSwitchToRegister={() => setIsRegistering(true)} />;
};
