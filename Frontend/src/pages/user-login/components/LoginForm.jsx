import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

// MODIFIED: This component now takes onSubmit, isLoading, and error as props
const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // MODIFIED: This function now calls the onSubmit prop from the parent
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Pass the form data up to the parent component
    onSubmit({ email, password });
  };

  return (
    // MODIFIED: Uses the handleFormSubmit function
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* MODIFIED: Displays the error passed down from the parent */}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <Input
          id="email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link to="/password-reset" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </Link>
        </div>
      </div>
      <div>
        {/* MODIFIED: Uses the isLoading prop from the parent */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;