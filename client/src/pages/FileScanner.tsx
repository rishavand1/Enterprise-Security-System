import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import FileDropzone from "@/components/ui/file-dropzone";
import { apiRequest } from "@/lib/queryClient";

interface ScanResult {
  id: number;
  fileName: string;
  fileSize: number;
  fileHash: string;
  isInfected: boolean;
  virus?: {
    id: number;
    name: string;
    type: string;
    description?: string;
    severity: string;
  };
  scannedAt: string;
}

export default function FileScanner() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setProgress(0);
    setShowResults(false);
  };

  const scanFile = async (file: File): Promise<ScanResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const fileContent = event.target?.result as ArrayBuffer;
          const base64Content = btoa(
            new Uint8Array(fileContent)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          const response = await apiRequest('POST', '/api/files/scan', {
            fileName: file.name,
            fileSize: file.size,
            fileContent: base64Content
          });
          
          const result = await response.json();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const startScan = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to scan",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanning(true);
      setShowResults(false);
      setScanResults([]);
      const results: ScanResult[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentFile(file.name);
        setProgress(Math.round(((i) / selectedFiles.length) * 100));
        
        // Simulate a small delay so the progress is visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const result = await scanFile(file);
          results.push(result);
        } catch (error) {
          console.error(`Error scanning ${file.name}:`, error);
          toast({
            title: "Scan Error",
            description: `Failed to scan ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      setProgress(100);
      setScanResults(results);
      setShowResults(true);
      
      // Count infected files
      const infectedCount = results.filter(r => r.isInfected).length;
      if (infectedCount > 0) {
        toast({
          title: "Threats Detected",
          description: `Found ${infectedCount} infected file${infectedCount > 1 ? 's' : ''}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scan Complete",
          description: "No threats were detected",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error during scan:", error);
      toast({
        title: "Scan Failed",
        description: "An error occurred during the scan process",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setSelectedFiles([]);
    setProgress(0);
    setShowResults(false);
    setScanResults([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-background-surface rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">File & Directory Scanner</h2>
      <p className="text-text-secondary mb-6">Upload files to scan for potential threats.</p>
      
      {!isScanning && !showResults && (
        <div className="mb-8">
          <FileDropzone onFilesSelected={handleFilesSelected} />
          
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Selected Files ({selectedFiles.length})</h3>
              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-background-elevated">
                    <div className="flex items-center">
                      <i className={`ri-file-${getFileIcon(file.name)} text-text-secondary mr-2`}></i>
                      <span className="text-text-primary">{file.name}</span>
                    </div>
                    <span className="text-sm text-text-secondary">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={startScan} className="px-4 py-2">
                  Scan Files
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isScanning && (
        <div id="scan-status" className="mb-8">
          <div className="bg-background-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-text-primary">
                Scanning {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}...
              </h3>
              <span className="text-sm text-text-secondary">{progress}%</span>
            </div>
            <div className="w-full bg-background-elevated rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mt-2 text-sm text-text-secondary">
              <span>Currently scanning: {currentFile}</span>
            </div>
          </div>
        </div>
      )}
      
      {showResults && (
        <div id="scan-results" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Scan Results</h3>
            <span className="px-3 py-1 bg-background-card text-status-info rounded-full text-sm font-medium">
              {scanResults.length} {scanResults.length === 1 ? 'File' : 'Files'} Scanned
            </span>
          </div>

          {scanResults.map((result, index) => (
            <div key={index} className="bg-background-card rounded-lg overflow-hidden">
              <div className={`flex items-center p-4 border-l-4 ${result.isInfected ? 'border-status-error' : 'border-status-success'}`}>
                <i className={`ri-file-${getFileIcon(result.fileName)} text-2xl text-text-secondary mr-3`}></i>
                <div className="flex-grow">
                  <h4 className="font-medium text-text-primary">{result.fileName}</h4>
                  <p className="text-sm text-text-secondary">{formatFileSize(result.fileSize)}</p>
                </div>
                <span className={`px-3 py-1 bg-background-elevated ${result.isInfected ? 'text-status-error' : 'text-status-success'} rounded-full text-sm`}>
                  {result.isInfected ? 'Infected' : 'Clean'}
                </span>
              </div>

              {result.isInfected && result.virus && (
                <div className="p-4 bg-background-elevated border-t border-background-surface">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-text-primary">Threat Details:</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Type:</span>
                      <span className="text-status-error font-medium">{result.virus.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Name:</span>
                      <span className="text-text-primary">{result.virus.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Hash:</span>
                      <span className="text-text-primary font-mono text-xs">{result.fileHash}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="destructive" size="sm" className="px-3 py-1.5">
                      Quarantine
                    </Button>
                    <Button variant="outline" size="sm" className="px-3 py-1.5">
                      Ignore
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-6">
            <Button 
              onClick={resetScan} 
              className="w-full px-4 py-3"
            >
              Scan More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'image-line';
  } else if (['mp4', 'avi', 'mov', 'webm'].includes(extension)) {
    return 'film-line';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'music-line';
  } else if (['pdf'].includes(extension)) {
    return 'file-pdf-line';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'file-word-line';
  } else if (['xls', 'xlsx'].includes(extension)) {
    return 'file-excel-line';
  } else if (['ppt', 'pptx'].includes(extension)) {
    return 'file-ppt-line';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'zip-line';
  } else if (['html', 'htm'].includes(extension)) {
    return 'file-code-line';
  } else if (['js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'py', 'java', 'cpp', 'h', 'c', 'cs', 'php', 'rb', 'go'].includes(extension)) {
    return 'code-s-line';
  } else if (['exe', 'msi', 'dmg', 'app'].includes(extension)) {
    return 'terminal-box-line';
  } else {
    return 'file-line';
  }
}
