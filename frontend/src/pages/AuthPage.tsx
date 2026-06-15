import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>LabelForge Pro</h1>
        <p>Production-ready annotation workspace for AI teams.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          {isRegister && (
            <input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-button" type="submit">{isRegister ? 'Create account' : 'Login'}</button>
        </form>
        <button className="text-button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : 'No account? Register'}
        </button>
      </div>
    </div>
  );
}
