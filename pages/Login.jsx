import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input } from '../components/ui';
import { Users, Lock } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const authenticationObject = {
        username: username,
        password: password,
      }
      const success = await login(authenticationObject);
      if (success) {
        navigate('/');
      } else {
        setError('User not found or inactive');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.06)] border border-[#f0f0f0] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-primary-dark" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Welcome Back</h1>
          <p className="text-slate-500 mt-2">
            Sign in to thrive<b className="text-primary">Q</b>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., admin, super, emp1"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type 'password'"
          />

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <Button type="submit" className="w-full flex justify-center items-center">
            <Lock className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Demo Credentials:</p>
          <p>superuser / ajay</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
