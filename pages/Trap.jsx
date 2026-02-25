import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';

const Trap = () => {
  const { resetBackendError } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">System Unavailable</h1>
        <p className="text-slate-600 mb-8">
          We're experiencing technical difficulties with our backend services. Please try again later or contact support
          if the issue persists.
        </p>
        <Button onClick={resetBackendError} className="w-full flex items-center justify-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    </div>
  );
};

export default Trap;
