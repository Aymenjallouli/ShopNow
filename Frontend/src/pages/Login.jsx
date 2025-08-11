import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, fetchCurrentUser } from '../features/auth/authSlice';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const Login = () => {
  const { t } = useTranslation();
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
      errors.email = t('login.errors.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('login.errors.emailInvalid');
    }
    if (!formData.password) {
      errors.password = t('login.errors.passwordRequired');
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
          // After successful login, fetch user data to ensure it's available
          dispatch(fetchCurrentUser());
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
              email: t('login.errors.invalidCredentials'),
              password: t('login.errors.invalidCredentials')
            });
          }
        });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t('login.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('login.or')}{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
              {t('login.createAccount')}
            </Link>
          </p>
        </div>
        
        {status === 'failed' && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-red-800">{t('login.failedTitle')}</h3>
            <div className="mt-2 text-sm text-red-700">
              {error && typeof error === 'object' ? (
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(error).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ))}
                </ul>
              ) : (
                <p>{typeof error === 'string' ? error : t('login.errors.emailOrPasswordIncorrect')}</p>
              )}
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('login.form.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.email 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('login.form.emailPlaceholder')}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('login.form.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.password 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('login.form.passwordPlaceholder')}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded transition-colors duration-200"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                {t('login.form.rememberMe')}
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
                {t('login.form.forgotPassword')}
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-200"
            >
              {status === 'loading' ? (
                <Loader size="sm" />
              ) : (
                t('login.form.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
