import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface CanvasErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function CanvasErrorFallback({ error, onRetry, showRetry = true }: CanvasErrorFallbackProps) {
  const handleReload = () => {
    console.log('🔄 Manual reload triggered from error fallback');
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
      <div className="game-card max-w-lg p-8 text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="game-title text-2xl font-bold">Failed to Initialize 3D Graphics</h2>
          <p className="text-muted-foreground">
            The game could not start due to a graphics initialization error.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-words">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This may be caused by:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 text-left list-disc list-inside">
            <li>WebGL not being supported or enabled in your browser</li>
            <li>Outdated graphics drivers</li>
            <li>Browser extensions blocking 3D content</li>
            <li>Hardware acceleration being disabled</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="game-button" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={handleReload} variant="outline" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            For best results, use a modern browser with WebGL support enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
