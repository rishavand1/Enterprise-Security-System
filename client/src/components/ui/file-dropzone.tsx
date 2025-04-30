import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type FileDropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  maxSizeMB?: number;
  multiple?: boolean;
};

export default function FileDropzone({ 
  onFilesSelected, 
  maxSizeMB = 25,
  multiple = true
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };
  
  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.size <= maxSizeMB * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      // Some files were too large
      console.error(`Some files exceeded the maximum size limit of ${maxSizeMB}MB`);
      // You could add a toast notification here
    }
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary bg-opacity-5" : "border-background-elevated"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <i className="ri-upload-cloud-2-line text-4xl text-text-secondary"></i>
        <p className="text-text-secondary">Drag and drop files here or</p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
        >
          Browse Files
        </Button>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple={multiple}
        />
        <p className="text-sm text-text-disabled">Maximum file size: {maxSizeMB}MB</p>
      </div>
    </div>
  );
}
