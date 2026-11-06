import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Cette page n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-primary">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
