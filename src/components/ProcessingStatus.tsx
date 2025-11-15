import React from 'react';
import { Card } from '@/components/ui/card';

//* -------------------------------------------------------------------------- */
//*                                 Lucide Icon                                */
//* -------------------------------------------------------------------------- */
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

//* -------------------------------------------------------------------------- */
//*                                     Lib                                    */
//* -------------------------------------------------------------------------- */
import { cn } from '@/lib/utils';

//* -------------------------------------------------------------------------- */
//*                             TS: ProcessingState                            */
//* -------------------------------------------------------------------------- */
export type ProcessingState = 'idle' | 'processing' | 'success' | 'error' | 'warning';

//* -------------------------------------------------------------------------- */
//*                          TS: ProcessingStatusProps                         */
//* -------------------------------------------------------------------------- */
interface ProcessingStatusProps {
  state: ProcessingState;
  message: string;
  details?: string;
  className?: string;
}

//* -------------------------------------------------------------------------- */
//*                                statusConfig                                */
//* -------------------------------------------------------------------------- */
const statusConfig = {
  idle: {
    icon: null,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    borderColor: 'border-border',
  },
  processing: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  success: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  error: {
    icon: XCircle,
    color: 'text-error',
    bgColor: 'bg-error/10',
    borderColor: 'border-error/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
};

//* -------------------------------------------------------------------------- */
//*                              ProcessingStatus                              */
//* -------------------------------------------------------------------------- */
export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  state,
  message,
  details,
  className,
}) => {

  /* -------------------------------------------------------------------------- */
  /*                                    Data                                    */
  /* -------------------------------------------------------------------------- */
  const config = statusConfig[state];
  const Icon = config.icon;

  if (state === 'idle') return null;

  /* -------------------------------------------------------------------------- */
  /*                                    View                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <Card className={cn(
      "p-6 border-2 transition-all duration-500 animate-in slide-in-from-bottom-2",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn("mt-1", config.color)}>
            <Icon className={cn(
              "h-5 w-5",
              state === 'processing' && "animate-spin"
            )} />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          <p className={cn("font-semibold", config.color)}>
            {message}
          </p>
          {details && (
            <p className="text-sm text-muted-foreground">
              {details}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};