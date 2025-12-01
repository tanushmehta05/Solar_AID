
import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isProcessing }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)"
      });
      return;
    }
    
    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Pass the file to parent component
    onImageSelected(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFileChange(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        accept="image/*"
        disabled={isProcessing}
      />
      
      {!previewUrl ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">Upload solar panel image</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPEG, PNG, WebP
              </p>
            </div>
            <Button 
              onClick={handleButtonClick} 
              className="mt-2 gradient-solar text-white"
              disabled={isProcessing}
            >
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={previewUrl}
            alt="Solar panel preview"
            className="w-full h-auto max-h-[400px] object-contain bg-black/5"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleClearImage}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {previewUrl && !isProcessing && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleButtonClick} variant="outline" className="mr-2">
            <ImageIcon className="h-4 w-4 mr-2" />
            Change Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
