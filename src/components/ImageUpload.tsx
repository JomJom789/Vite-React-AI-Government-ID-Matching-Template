//* -------------------------------------------------------------------------- */
//*                                    Hooks                                   */
//* -------------------------------------------------------------------------- */
import React, { 
  useCallback, 
  useState 
} from 'react';

//* -------------------------------------------------------------------------- */
//*                                   Shadcn                                   */
//* -------------------------------------------------------------------------- */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

//* -------------------------------------------------------------------------- */
//*                                Lucide Icons                                */
//* -------------------------------------------------------------------------- */
import { Upload, X, Check } from 'lucide-react';

//* -------------------------------------------------------------------------- */
//*                                    Libs                                    */
//* -------------------------------------------------------------------------- */
import { cn } from '@/lib/utils';

//* -------------------------------------------------------------------------- */
//*                              ImageUploadProps                              */
//* -------------------------------------------------------------------------- */
interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  label: string;
  description: string;
  uploadedImage?: File | null;
  className?: string;
}

//* -------------------------------------------------------------------------- */
//*                                 ImageUpload                                */
//* -------------------------------------------------------------------------- */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  label,
  description,
  uploadedImage,
  className,
}) => {

  /* -------------------------------------------------------------------------- */
  /*                                    Data                                    */
  /* -------------------------------------------------------------------------- */
  const [isDragOver, setIsDragOver] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                               handleDragEnter                              */
  /* -------------------------------------------------------------------------- */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               handleDragLeave                              */
  /* -------------------------------------------------------------------------- */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               handleDragOver                               */
  /* -------------------------------------------------------------------------- */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                 handleDrop                                 */
  /* -------------------------------------------------------------------------- */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onImageUpload(imageFile);
    }
  }, [onImageUpload]);

  /* -------------------------------------------------------------------------- */
  /*                              handleFileSelect                              */
  /* -------------------------------------------------------------------------- */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  /* -------------------------------------------------------------------------- */
  /*                                 clearImage                                 */
  /* -------------------------------------------------------------------------- */
  const clearImage = useCallback(() => {
    onImageUpload(null as any);
  }, [onImageUpload]);

  /* -------------------------------------------------------------------------- */
  /*                                    View                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{label}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {uploadedImage ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded document"
                className="w-full h-48 object-cover rounded-lg border-2 border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-success">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Image uploaded successfully</span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer",
              isDragOver
                ? "border-primary bg-upload-zone-active"
                : "border-upload-zone-border bg-upload-zone hover:bg-upload-zone-active hover:border-primary"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById(`file-input-${label}`)?.click()}
          >
            <Upload className={cn(
              "mx-auto h-12 w-12 mb-4 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="space-y-2">
              <p className={cn(
                "text-sm font-medium transition-colors",
                isDragOver ? "text-primary" : "text-foreground"
              )}>
                Drag and drop your image here
              </p>
              <p className="text-xs text-muted-foreground">or</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Supports: JPG, PNG, JPEG (Max 10MB)
            </p>
          </div>
        )}

        <input
          id={`file-input-${label}`}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};