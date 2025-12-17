// src/components/ui/LoadingSpinner.tsx

interface LoadingSpinnerProps {
    fullScreen?: boolean;
  }
  
  export default function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
  
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }