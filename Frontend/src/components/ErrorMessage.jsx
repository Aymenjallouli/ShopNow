import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message }) => {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4 my-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-red-800">Erreur</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message || 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
