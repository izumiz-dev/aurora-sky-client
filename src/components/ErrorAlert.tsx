import type { ApiError } from '../lib/api-error-handler';
import { getErrorDisplay } from '../lib/api-error-handler';
import { route } from 'preact-router';

interface ErrorAlertProps {
  error: ApiError | Error;
  onRetry?: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  const isApiError = 'statusCode' in error || 'isRateLimit' in error;
  const display = isApiError 
    ? getErrorDisplay(error as ApiError)
    : { title: 'エラー', description: error.message };

  const handleAction = () => {
    if ((error as ApiError).statusCode === 401) {
      route('/login');
      return;
    }
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className={`glass-card p-6 ${(error as ApiError).isRateLimit ? 'border-yellow-500/30' : 'border-red-500/30'} border`}>
      <div className="flex items-start gap-4">
        {/* アイコン */}
        <div className={`flex-shrink-0 ${(error as ApiError).isRateLimit ? 'text-yellow-400' : 'text-red-400'}`}>
          {(error as ApiError).isRateLimit ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* コンテンツ */}
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${(error as ApiError).isRateLimit ? 'text-yellow-300' : 'text-red-300'}`}>
            {display.title}
          </h3>
          <p className="text-white/80 text-sm">
            {display.description}
          </p>
          
          {display.action && (
            <div className="mt-3">
              {(error as ApiError).statusCode === 401 ? (
                <button
                  onClick={handleAction}
                  className="glass-button btn-primary-small"
                >
                  ログイン画面へ
                </button>
              ) : onRetry ? (
                <button
                  onClick={handleAction}
                  className="glass-button btn-primary-small"
                  disabled={(error as ApiError).isRateLimit}
                >
                  再試行
                </button>
              ) : (
                <p className="text-white/60 text-sm italic">
                  {display.action}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};