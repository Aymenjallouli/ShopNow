import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
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
      errors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Le nom est requis';
    }
    
    // Username est optionnel, aucune validation nécessaire
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (formData.password !== formData.password2) {
      errors.password2 = 'Les mots de passe ne correspondent pas';
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
          alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
          navigate('/login');
        })
        .catch((error) => {
          console.log("Erreur d'inscription:", error);
          
          // Si l'erreur concerne un email déjà utilisé, afficher un message spécifique
          if (error && error.email && error.email.includes("déjà utilisée")) {
            alert(`Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email ou vous connecter avec celle-ci.`);
          }
          
          // Error is handled by the auth slice
        });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>
        
        {status === 'failed' && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Échec de l'inscription</h3>
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
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.username ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Nom d'utilisateur (optionnel)"
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
              )}
            </div>
            <div>
              <label htmlFor="first_name" className="sr-only">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.first_name ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Prénom"
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="sr-only">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.last_name ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Nom"
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
              )}
            </div>
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
                } bg-gray-50 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Mot de passe"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="password2" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                value={formData.password2}
                onChange={handleChange}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password2 ? 'border-red-300' : 'border-gray-200'
                } bg-gray-50 placeholder-gray-400 text-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Confirmer le mot de passe"
              />
              {formErrors.password2 && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password2}</p>
              )}
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
                'Créer compte'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
