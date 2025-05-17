import { useEffect } from 'preact/hooks';

interface SnackbarProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Snackbar = ({ message, onClose, duration = 5000 }: SnackbarProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 ambient-snackbar">
      <div className="aurora-gradient-lite rounded-xl px-6 py-4 min-w-[250px] max-w-[400px]">
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};
