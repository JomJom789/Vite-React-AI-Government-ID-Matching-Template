//* -------------------------------------------------------------------------- */
//*                                    Hooks                                   */
//* -------------------------------------------------------------------------- */
import React from 'react';

//* -------------------------------------------------------------------------- */
//*                                   Shadcn                                   */
//* -------------------------------------------------------------------------- */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

//* -------------------------------------------------------------------------- */
//*                                   Lucide                                   */
//* -------------------------------------------------------------------------- */
import { CheckCircle, XCircle, FileText, Image } from 'lucide-react';

//* -------------------------------------------------------------------------- */
//*                                     Lib                                    */
//* -------------------------------------------------------------------------- */
import { cn } from '@/lib/utils';

//* -------------------------------------------------------------------------- */
//*                             VerificationResult                             */
//* -------------------------------------------------------------------------- */
export interface VerificationResult {
  templateMatch: {
    isMatch: boolean;
    confidence: number;
    details: string;
  };
  textExtraction: {
    extractedLabels: string[];
    extractedData: { [key: string]: string };
    confidence: number;
    details: string;
  };
  overall: {
    isValid: boolean;
    confidence: number;
  };
}

//* -------------------------------------------------------------------------- */
//*                          VerificationResultsProps                          */
//* -------------------------------------------------------------------------- */
interface VerificationResultsProps {
  result: VerificationResult;
  className?: string;
}

//* -------------------------------------------------------------------------- */
//*                             VerificationResults                            */
//* -------------------------------------------------------------------------- */
export const VerificationResults: React.FC<VerificationResultsProps> = ({
  result,
  className,
}) => {

  /* -------------------------------------------------------------------------- */
  /*                                    Data                                    */
  /* -------------------------------------------------------------------------- */
  const { templateMatch, textExtraction, overall } = result;

  /* -------------------------------------------------------------------------- */
  /*                                    View                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <Card className={cn("p-6 space-y-6", className)}>

      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          overall.isValid ? "bg-success/20 text-success" : "bg-error/20 text-error"
        )}>
          {overall.isValid ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Verification {overall.isValid ? 'Successful' : 'Failed'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Overall confidence: {Math.round(overall.confidence * 100)}%
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        
        {/* -------------------------------------------------------------------------- */}
        {/*                           Template Match Results                           */}
        {/* -------------------------------------------------------------------------- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Template Matching</h4>
            <Badge variant={templateMatch.isMatch ? "default" : "destructive"}>
              {templateMatch.isMatch ? 'Match' : 'No Match'}
            </Badge>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confidence:</span>
              <span className="font-medium">
                {Math.round(templateMatch.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {templateMatch.details}
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------------------------- */}
        {/*                           Text Extraction Results                          */}
        {/* -------------------------------------------------------------------------- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Text Extraction</h4>
            <Badge variant="secondary">
              {textExtraction.extractedLabels.length} Labels
            </Badge>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>OCR Confidence:</span>
              <span className="font-medium">
                {Math.round(textExtraction.confidence * 100)}%
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Extracted Labels:
                </p>
                <div className="flex flex-wrap gap-1">
                  {textExtraction.extractedLabels.map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {Object.keys(textExtraction.extractedData).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Extracted Values:
                  </p>
                  <div className="space-y-1">
                    {Object.entries(textExtraction.extractedData).map(([label, value]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="font-medium">{label}:</span>
                        <span className="text-muted-foreground max-w-24 truncate" title={value}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {textExtraction.details}
            </p>
          </div>
        </div>

      </div>

    </Card>
  );
};