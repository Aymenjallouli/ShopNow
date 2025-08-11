import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../features/auth/authSlice';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'customer',
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  
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
    if (!formData.first_name.trim()) {
      errors.first_name = t('register.errors.firstNameRequired');
    }
    if (!formData.last_name.trim()) {
      errors.last_name = t('register.errors.lastNameRequired');
    }
    // Username est optionnel
    if (!formData.email) {
      errors.email = t('register.errors.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      errors.email = t('register.errors.emailInvalid');
    }
    if (!formData.password) {
      errors.password = t('register.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      errors.password = t('register.errors.passwordMinLength');
    }
    if (formData.password !== formData.password2) {
      errors.password2 = t('register.errors.passwordsDontMatch');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Préparer les données pour l'envoi
      const submitData = {...formData};
      
      // Si le username est vide, c'est OK, le backend utilisera l'email comme username par défaut
      
      dispatch(register(submitData))
        .unwrap()
        .then(() => {
          // Afficher un message de succès avant la redirection
          alert(t('register.success'));
          navigate('/login');
        })
        .catch((error) => {
          console.log("Erreur d'inscription:", error);
          // Si l'erreur concerne un email déjà utilisé, afficher un message spécifique
          if (error && error.email && error.email.includes("déjà utilisée")) {
            alert(t('register.emailUsed'));
          }
          // Error is handled by the auth slice
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
            {t('register.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('register.or')}{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
              {t('register.loginLink')}
            </Link>
          </p>
        </div>
        
        {status === 'failed' && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-red-800">{t('register.failedTitle')}</h3>
            <div className="mt-2 text-sm text-red-700">
              {error && typeof error === 'object' ? (
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(error).map(([key, value]) => (
                    <li key={key}>{`${key}: ${value}`}</li>
                  ))}
                </ul>
              ) : (
                <p>{error}</p>
              )}
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="space-y-4">
              <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.username')}
                  </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.username 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('register.form.usernamePlaceholder')}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
              
              <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.firstName')}
                  </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.first_name 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('register.form.firstNamePlaceholder')}
                />
                {formErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                )}
              </div>
              
              <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.lastName')}
                  </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.last_name 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('register.form.lastNamePlaceholder')}
                />
                {formErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                )}
              </div>
              
              <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.email')}
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
                  placeholder={t('register.form.emailPlaceholder')}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.password')}
                  </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.password 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('register.form.passwordPlaceholder')}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              
              <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-slate-700 mb-1">
                    {t('register.form.password2')}
                  </label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password2}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    formErrors.password2 
                      ? 'border-red-300 focus:ring-red-200' 
                      : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-300'
                  }`}
                  placeholder={t('register.form.password2Placeholder')}
                />
                {formErrors.password2 && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password2}</p>
                )}
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('register.form.role')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent border-slate-200 focus:ring-emerald-200 focus:border-emerald-300"
                >
                  <option value="customer">{t('register.form.roleCustomer')}</option>
                  <option value="shop_owner">{t('register.form.roleShopOwner')}</option>
                </select>
              </div>
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
                t('register.form.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
