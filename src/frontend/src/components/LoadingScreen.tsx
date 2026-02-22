import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  retryAttempt?: number;
  maxRetries?: number;
}

export default function LoadingScreen({ message = 'Loading...', retryAttempt, maxRetries }: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          {retryAttempt !== undefined && maxRetries !== undefined && (
            <p className="text-sm text-muted-foreground">
              Attempt {retryAttempt} of {maxRetries}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
