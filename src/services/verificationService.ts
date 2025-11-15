import { createWorker } from 'tesseract.js';
import { VerificationResult } from '@/components/VerificationResults';

//* -------------------------------------------------------------------------- */
//*                       OpenCV will be loaded globally                       */
//* -------------------------------------------------------------------------- */
declare global {
  interface Window {
    cv: any;
  }
}

//* -------------------------------------------------------------------------- */
//*                             VerificationService                            */
//* -------------------------------------------------------------------------- */
class VerificationService {

  private tesseractWorker: any = null;
  private isOpenCVReady = false;

  /* -------------------------------------------------------------------------- */
  /*                                 initialize                                 */
  /* -------------------------------------------------------------------------- */
  async initialize(): Promise<void> {
    await this.initializeOpenCV();
    await this.initializeTesseract();
  }

  /* -------------------------------------------------------------------------- */
  /*                              initializeOpenCV                              */
  /* -------------------------------------------------------------------------- */
  private async initializeOpenCV(): Promise<void> {
    return new Promise((resolve) => {
      if (window.cv && window.cv.Mat) {
        this.isOpenCVReady = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      script.onload = () => {
        if (window.cv) {
          window.cv.onRuntimeInitialized = () => {
            this.isOpenCVReady = true;
            resolve();
          };
        }
      };
      document.head.appendChild(script);
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                             initializeTesseract                            */
  /* -------------------------------------------------------------------------- */
  private async initializeTesseract(): Promise<void> {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await createWorker('eng');
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               verifyDocument                               */
  /* -------------------------------------------------------------------------- */
  async verifyDocument(
    idImageFile: File,
    referenceImageFile: File,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<VerificationResult> {

    if (!this.isOpenCVReady || !this.tesseractWorker) {
      throw new Error('Verification service not initialized');
    }

    try {

      onProgress?.('Validating image quality...', 5);
      
      // Validate image quality
      await this.validateImageQuality(idImageFile);
      
      onProgress?.('Loading images...', 10);

      // Load images
      const idImage = await this.loadImageFromFile(idImageFile);
      const referenceImage = await this.loadImageFromFile(referenceImageFile);

      onProgress?.('Performing template matching...', 30);
      
      // Template matching
      const templateResult = await this.performTemplateMatching(idImage, referenceImage);

      onProgress?.('Extracting text labels...', 60);
      
      // Text extraction
      const textResult = await this.extractTextLabels(idImageFile);

      onProgress?.('Finalizing verification...', 90);

      // Calculate overall result
      const overall = {
        isValid: templateResult.isMatch && textResult.extractedLabels.length > 0,
        confidence: (templateResult.confidence + textResult.confidence) / 2,
      };

      onProgress?.('Verification complete', 100);

      return {
        templateMatch: templateResult,
        textExtraction: textResult,
        overall,
      };

    } catch (error) {
      console.error('Verification error:', error);
      throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              loadImageFromFile                             */
  /* -------------------------------------------------------------------------- */
  private async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                           performTemplateMatching                          */
  /* -------------------------------------------------------------------------- */
  private async performTemplateMatching(
    sourceImg: HTMLImageElement,
    templateImg: HTMLImageElement
  ): Promise<{ isMatch: boolean; confidence: number; details: string }> {
    try {
      const cv = window.cv;
      
      // Create canvases for processing
      const sourceCanvas = document.createElement('canvas');
      const templateCanvas = document.createElement('canvas');
      const sourceCtx = sourceCanvas.getContext('2d')!;
      const templateCtx = templateCanvas.getContext('2d')!;

      // Resize images to manageable size for processing
      const maxSize = 800;
      const sourceAspect = sourceImg.width / sourceImg.height;
      const templateAspect = templateImg.width / templateImg.height;

      let sourceWidth = Math.min(sourceImg.width, maxSize);
      let sourceHeight = sourceWidth / sourceAspect;
      if (sourceHeight > maxSize) {
        sourceHeight = maxSize;
        sourceWidth = sourceHeight * sourceAspect;
      }

      let templateWidth = Math.min(templateImg.width, maxSize);
      let templateHeight = templateWidth / templateAspect;
      if (templateHeight > maxSize) {
        templateHeight = maxSize;
        templateWidth = templateHeight * templateAspect;
      }

      sourceCanvas.width = sourceWidth;
      sourceCanvas.height = sourceHeight;
      templateCanvas.width = templateWidth;
      templateCanvas.height = templateHeight;

      sourceCtx.drawImage(sourceImg, 0, 0, sourceWidth, sourceHeight);
      templateCtx.drawImage(templateImg, 0, 0, templateWidth, templateHeight);

      // Convert to OpenCV mats
      const srcMat = cv.imread(sourceCanvas);
      const templateMat = cv.imread(templateCanvas);
      
      // Convert to grayscale
      const srcGray = new cv.Mat();
      const templateGray = new cv.Mat();
      cv.cvtColor(srcMat, srcGray, cv.COLOR_RGBA2GRAY);
      cv.cvtColor(templateMat, templateGray, cv.COLOR_RGBA2GRAY);

      // Perform template matching
      const result = new cv.Mat();
      cv.matchTemplate(srcGray, templateGray, result, cv.TM_CCOEFF_NORMED);

      // Find the best match
      const minMaxLoc = cv.minMaxLoc(result);
      const confidence = minMaxLoc.maxVal;

      // Clean up
      srcMat.delete();
      templateMat.delete();
      srcGray.delete();
      templateGray.delete();
      result.delete();

      const isMatch = confidence > 0.3; // Threshold for match
      const details = `Template matching confidence: ${(confidence * 100).toFixed(1)}%. ${
        isMatch ? 'Documents appear to match the expected layout.' : 'Documents do not match the expected layout pattern.'
      }`;

      return {
        isMatch,
        confidence,
        details,
      };
    } catch (error) {
      console.error('Template matching error:', error);
      return {
        isMatch: false,
        confidence: 0,
        details: 'Template matching failed due to processing error.',
      };
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              extractTextLabels                             */
  /* -------------------------------------------------------------------------- */
  private async extractTextLabels(imageFile: File): Promise<{
    extractedLabels: string[];
    extractedData: { [key: string]: string };
    confidence: number;
    details: string;
  }> {
    try {
      const { data } = await this.tesseractWorker.recognize(imageFile);
      
      // Extract potential field labels (common ID document labels)
      const labelPatterns = [
        { label: 'Name', patterns: ['name', 'first name', 'last name', 'full name'] },
        { label: 'Date of Birth', patterns: ['date of birth', 'dob', 'birth date', 'born'] },
        { label: 'ID Number', patterns: ['id number', 'license number', 'document number', 'dl'] },
        { label: 'Address', patterns: ['address', 'street', 'residence'] },
        { label: 'City', patterns: ['city'] },
        { label: 'State', patterns: ['state', 'province'] },
        { label: 'ZIP Code', patterns: ['zip', 'postal code', 'zip code'] },
        { label: 'Sex', patterns: ['sex', 'gender'] },
        { label: 'Height', patterns: ['height', 'ht'] },
        { label: 'Weight', patterns: ['weight', 'wt'] },
        { label: 'Issue Date', patterns: ['issue date', 'issued', 'iss'] },
        { label: 'Expiration', patterns: ['expiration date', 'expires', 'exp'] },
        { label: 'Class', patterns: ['class', 'license class'] }
      ];

      const extractedText = data.text;
      const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
      
      const foundLabels: string[] = [];
      const extractedData: { [key: string]: string } = {};

      // Process each line to find label-value pairs
      for (const line of lines) {
        const lowerLine = line.toLowerCase().trim();
        
        for (const { label, patterns } of labelPatterns) {
          for (const pattern of patterns) {
            if (lowerLine.includes(pattern)) {
              foundLabels.push(label);
              
              // Try to extract the value after the label
              const regex = new RegExp(`${pattern}[:\\s]*(.+)`, 'i');
              const match = line.match(regex);
              if (match && match[1]) {
                extractedData[label] = match[1].trim();
              } else {
                // If no value found on same line, check next line
                const lineIndex = lines.indexOf(line);
                if (lineIndex < lines.length - 1) {
                  const nextLine = lines[lineIndex + 1].trim();
                  if (nextLine && nextLine.length > 0) {
                    extractedData[label] = nextLine;
                  }
                }
              }
              break;
            }
          }
        }
      }

      // Remove duplicates and sort
      const uniqueLabels = [...new Set(foundLabels)].sort();

      const confidence = Math.min(data.confidence / 100, 1);
      const details = `OCR extracted ${data.text.length} characters with ${data.confidence.toFixed(1)}% confidence. Found ${uniqueLabels.length} document field labels with values.`;

      return {
        extractedLabels: uniqueLabels,
        extractedData,
        confidence,
        details,
      };
    } catch (error) {
      console.error('Text extraction error:', error);
      return {
        extractedLabels: [],
        extractedData: {},
        confidence: 0,
        details: 'Text extraction failed due to OCR processing error.',
      };
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            validateImageQuality                            */
  /* -------------------------------------------------------------------------- */
  private async validateImageQuality(imageFile: File): Promise<void> {

    // Load image for quality analysis
    const image = await this.loadImageFromFile(imageFile);

    // Check for potential blur using basic edge detection
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Resize for analysis
    const analysisSize = 400;
    canvas.width = analysisSize;
    canvas.height = analysisSize;
    ctx.drawImage(image, 0, 0, analysisSize, analysisSize);
    
    const imageData = ctx.getImageData(0, 0, analysisSize, analysisSize);
    const data = imageData.data;
    
    // Simple edge detection to check for blur
    let edgeStrength = 0;
    const threshold = 30;
    
    for (let i = 0; i < data.length - 4; i += 4) {
      const current = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const next = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
      const diff = Math.abs(current - next);
      
      if (diff > threshold) {
        edgeStrength++;
      }
    }
    
    const edgeRatio = edgeStrength / (data.length / 4);
    
    if (edgeRatio < 0.1) {
      throw new Error('Image quality too low: Image appears to be blurry or lacks detail. Please upload a clearer image.');
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   cleanup                                  */
  /* -------------------------------------------------------------------------- */
  async cleanup(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }

}

export const verificationService = new VerificationService();