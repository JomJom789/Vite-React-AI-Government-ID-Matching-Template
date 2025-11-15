//* -------------------------------------------------------------------------- */
//*                                    Hooks                                   */
//* -------------------------------------------------------------------------- */
import React, { 
  useState, 
  useEffect 
} from 'react';

//* -------------------------------------------------------------------------- */
//*                                    Hooks                                   */
//* -------------------------------------------------------------------------- */
import { useToast } from '@/hooks/use-toast';

//* -------------------------------------------------------------------------- */
//*                                   Shadcn                                   */
//* -------------------------------------------------------------------------- */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

//* -------------------------------------------------------------------------- */
//*                                 Components                                 */
//* -------------------------------------------------------------------------- */
import { ImageUpload } from '@/components/ImageUpload';

import { 
  ProcessingStatus,     // Components
  ProcessingState       // Type
} from '@/components/ProcessingStatus';

import { 
  VerificationResults,  // Components
  VerificationResult    // Type
} from '@/components/VerificationResults';

//* -------------------------------------------------------------------------- */
//*                                    Icons                                   */
//* -------------------------------------------------------------------------- */
import { 
  Shield, 
  FileCheck, 
  Sparkles 
} from 'lucide-react';

//* -------------------------------------------------------------------------- */
//*                                     API                                    */
//* -------------------------------------------------------------------------- */
import { verificationService } from '@/services/verificationService';

//* -------------------------------------------------------------------------- */
//*                                    Index                                   */
//* -------------------------------------------------------------------------- */
const Index = () => {

  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */

  const { toast } = useToast();

  /* -------------------------------------------------------------------------- */
  /*                                    Data                                    */
  /* -------------------------------------------------------------------------- */
  const [idImage, setIdImage] = useState<File | null>(null);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
    
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingDetails, setProcessingDetails] = useState('');

  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  /* -------------------------------------------------------------------------- */
  /*                                  Triggers                                  */
  /* -------------------------------------------------------------------------- */
  const [isServiceReady, setIsServiceReady] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                  useEffect                                 */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    
    const initializeService = async () => {
      try {

        setProcessingState('processing');
        setProcessingMessage('Initializing verification services...');
        setProcessingDetails('Loading OpenCV and Tesseract.js libraries');
        
        await verificationService.initialize();
        setIsServiceReady(true);
        setProcessingState('success');
        setProcessingMessage('Services ready');
        setProcessingDetails('OpenCV and Tesseract.js loaded successfully');
        
        setTimeout(() => {
          setProcessingState('idle');
        }, 2000);

      } catch (error) {

        setProcessingState('error');
        setProcessingMessage('Failed to initialize services');
        setProcessingDetails('Please refresh the page to try again');
        toast({
          title: "Initialization Error",
          description: "Failed to load verification services. Please refresh the page.",
          variant: "destructive",
        });

      }
    };

    initializeService();

    return () => {
      verificationService.cleanup();
    };

  }, [toast]);

  /* -------------------------------------------------------------------------- */
  /*                             handleVerification                             */
  /* -------------------------------------------------------------------------- */
  const handleVerification = async () => {
    
    if (!idImage || !referenceImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both the ID image and reference template.",
        variant: "destructive",
      });
      return;
    }

    if (!isServiceReady) {
      toast({
        title: "Service Not Ready",
        description: "Please wait for the verification services to initialize.",
        variant: "destructive",
      });
      return;
    }

    try {

      setVerificationResult(null);
      setProcessingState('processing');
      
      const result = await verificationService.verifyDocument(
        idImage,
        referenceImage,
        (stage, progress) => {
          setProcessingMessage(stage);
          setProcessingDetails(`Progress: ${progress}%`);
        }
      );

      setVerificationResult(result);

      setProcessingState(result.overall.isValid ? 'success' : 'warning');
      
      setProcessingMessage(
        result.overall.isValid 
          ? 'Verification completed successfully!' 
          : 'Verification completed with warnings'
      );

      setProcessingDetails(
        `Overall confidence: ${Math.round(result.overall.confidence * 100)}%`
      );

      toast({
        title: result.overall.isValid ? "Verification Success" : "Verification Warning",
        description: result.overall.isValid 
          ? "Document verification passed all checks." 
          : "Document verification completed with some issues.",
        variant: result.overall.isValid ? "default" : "destructive",
      });

    } catch (error) {
      setProcessingState('error');
      setProcessingMessage('Verification failed');
      setProcessingDetails(error instanceof Error ? error.message : 'Unknown error occurred');
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    }

  };

  /* -------------------------------------------------------------------------- */
  /*                              resetVerification                             */
  /* -------------------------------------------------------------------------- */
  const resetVerification = () => {
    setIdImage(null);
    setReferenceImage(null);
    setVerificationResult(null);
    setProcessingState('idle');
    setProcessingMessage('');
    setProcessingDetails('');
  };

  const canVerify = idImage && referenceImage && isServiceReady && processingState !== 'processing';

  /* -------------------------------------------------------------------------- */
  /*                                    View                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-surface">
      
      {/* Header */}
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Shield className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Government ID Verification
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Secure, fast, and accurate document verification using advanced AI technology
            </p>
            <div className="flex justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span>Template Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>OCR Text Extraction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* -------------------------------------------------------------------------- */}
          {/*                               Upload Section                               */}
          {/* -------------------------------------------------------------------------- */}
          <div className="grid md:grid-cols-2 gap-6">
            <ImageUpload
              onImageUpload={setIdImage}
              label="Government ID"
              description="Upload the government-issued ID document to verify"
              uploadedImage={idImage}
            />
            <ImageUpload
              onImageUpload={setReferenceImage}
              label="Reference Template"
              description="Upload a reference template for comparison"
              uploadedImage={referenceImage}
            />
          </div>

          {/* -------------------------------------------------------------------------- */}
          {/*                              Processing Status                             */}
          {/* -------------------------------------------------------------------------- */}
          <ProcessingStatus
            state={processingState}
            message={processingMessage}
            details={processingDetails}
          />

          {/* -------------------------------------------------------------------------- */}
          {/*                               Action Buttons                               */}
          {/* -------------------------------------------------------------------------- */}
          <Card className="p-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleVerification}
                disabled={!canVerify}
                size="lg"
                className="min-w-40"
              >
                {processingState === 'processing' ? 'Verifying...' : 'Start Verification'}
              </Button>
              <Button
                variant="outline"
                onClick={resetVerification}
                size="lg"
                disabled={processingState === 'processing'}
              >
                Reset
              </Button>
            </div>
          </Card>

          {/* -------------------------------------------------------------------------- */}
          {/*                                   Results                                  */}
          {/* -------------------------------------------------------------------------- */}
          {verificationResult && (
            <VerificationResults result={verificationResult} />
          )}

          {/* -------------------------------------------------------------------------- */}
          {/*                                Instructions                                */}
          {/* -------------------------------------------------------------------------- */}
          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">How it works:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</div>
                  Upload Images
                </div>
                <p className="text-muted-foreground">
                  Upload both the government ID and a reference template for comparison.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">2</div>
                  AI Processing
                </div>
                <p className="text-muted-foreground">
                  Our AI analyzes document layout and extracts text labels for verification.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">3</div>
                  Get Results
                </div>
                <p className="text-muted-foreground">
                  Receive detailed verification results with confidence scores and extracted data.
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Index;
