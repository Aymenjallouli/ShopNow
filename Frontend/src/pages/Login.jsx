import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  
  // Get the return path (if any) from location state
  const from = location.state?.from || '/';

  // Format error message for display est supprimé car nous utilisons maintenant l'objet d'erreur directement
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(login(formData))
        .unwrap()
        .then(() => {
          navigate(from);
        })
        .catch((error) => {
          // Gestion d'erreur simplifiée
          console.log("Erreur de connexion:", error);
          
          // Si l'erreur contient un message spécifique sur l'email ou le mot de passe
          if (error && typeof error === 'object') {
            // Pour les erreurs spécifiques aux champs
            if (error.email) {
              setFormErrors(prev => ({ ...prev, email: error.email }));
            }
            if (error.password) {
              setFormErrors(prev => ({ ...prev, password: error.password }));
            }
            // Pour les erreurs générales (détail)
            if (error.detail && !error.email && !error.password) {
              setFormErrors(prev => ({
                ...prev,
                email: error.detail,
                password: error.detail
              }));
            }
          } else {
            // Erreur générique
            setFormErrors({
              email: "Identifiants invalides",
              password: "Identifiants invalides"
            });
          }
        });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              créer un nouveau compte
            </Link>
          </p>
        </div>
        
        {status === 'failed' && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Échec de connexion</h3>
            <div className="mt-2 text-sm text-red-700">
              {error && typeof error === 'object' ? (
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(error).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ))}
                </ul>
              ) : (
                <p>{typeof error === 'string' ? error : "Email ou mot de passe incorrect"}</p>
              )}
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Adresse email"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Mot de passe"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Mot de passe oublié?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {status === 'loading' ? (
                <Loader size="sm" />
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
