import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import FileDropzone from "@/components/ui/file-dropzone";

export default function DevMode() {
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [showProjectStructure, setShowProjectStructure] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scanType, setScanType] = useState("comprehensive");
  const [severityLevel, setSeverityLevel] = useState("all");
  const { toast } = useToast();

  const handleProjectFilesSelected = (files: File[]) => {
    setProjectFiles(files);
    setShowProjectStructure(true);
    setShowResults(false);
  };

  const runProjectAnalysis = () => {
    if (projectFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select project files to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      
      toast({
        title: "Analysis Complete",
        description: "Project analysis finished with 19 potential issues",
        variant: "default",
      });
    }, 2000);
  };

  return (
    <div className="bg-background-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Developer Mode</h2>
          <p className="text-text-secondary mt-1">Advanced tools for multiple file analysis</p>
        </div>
        <span className="px-3 py-1 bg-primary bg-opacity-20 text-primary rounded-full text-sm font-medium">
          Beta
        </span>
      </div>

      {/* Project Upload */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-text-primary">Project Analysis</h3>
        
        {!showProjectStructure && (
          <FileDropzone 
            onFilesSelected={handleProjectFilesSelected}
            maxSizeMB={50}
            multiple={true}
          />
        )}
      </div>

      {/* Project Structure */}
      {showProjectStructure && (
        <div id="project-structure" className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-text-primary">Project Structure</h3>
          
          <div className="bg-background-card rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              <li className="flex items-center">
                <i className="ri-folder-line mr-2 text-text-secondary"></i>
                <span className="text-text-primary font-medium">src/</span>
              </li>
              {projectFiles.slice(0, 10).map((file, index) => {
                const isDirectory = file.name.indexOf('.') === -1;
                const parts = file.name.split('/');
                const fileName = parts[parts.length - 1];
                const depth = parts.length - 1;
                
                return (
                  <li key={index} className={`flex items-center pl-${depth * 6 + 6}`}>
                    <i className={`ri-${isDirectory ? 'folder' : 'file-code'}-line mr-2 text-text-secondary`}></i>
                    <span className={`text-text-primary ${isDirectory ? 'font-medium' : ''}`}>{fileName}</span>
                  </li>
                );
              })}
              {projectFiles.length > 10 && (
                <li className="flex items-center pl-6 text-text-secondary">
                  ... and {projectFiles.length - 10} more files
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      {showProjectStructure && (
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-text-secondary mb-2">Scan Type</label>
            <Select 
              value={scanType} 
              onValueChange={setScanType}
            >
              <SelectTrigger className="w-full bg-background-card text-text-primary rounded">
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive (All Checks)</SelectItem>
                <SelectItem value="security">Security Vulnerabilities Only</SelectItem>
                <SelectItem value="quality">Code Quality Issues</SelectItem>
                <SelectItem value="dependencies">Dependency Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Severity Level</label>
            <Select 
              value={severityLevel} 
              onValueChange={setSeverityLevel}
            >
              <SelectTrigger className="w-full bg-background-card text-text-primary rounded">
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="critical-high">Critical & High Only</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-text-secondary mb-2">Action</label>
            <Button
              onClick={runProjectAnalysis}
              disabled={isAnalyzing}
              className="w-full px-6 py-2.5"
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {showResults && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Files Analyzed</p>
                  <h4 className="text-text-primary text-2xl font-semibold mt-1">{projectFiles.length}</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                  <i className="ri-file-list-3-line text-primary text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Security Issues</p>
                  <h4 className="text-status-error text-2xl font-semibold mt-1">7</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-status-error bg-opacity-20 flex items-center justify-center">
                  <i className="ri-shield-flash-line text-status-error text-xl"></i>
                </div>
              </div>
            </div>
            
            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Code Quality</p>
                  <h4 className="text-status-warning text-2xl font-semibold mt-1">12</h4>
                </div>
                <div className="w-10 h-10 rounded-full bg-status-warning bg-opacity-20 flex items-center justify-center">
                  <i className="ri-code-line text-status-warning text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Results Overview */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-text-primary">Security Issues</h3>
            
            <div className="bg-background-card rounded-lg divide-y divide-background-elevated">
              {/* Issue Items */}
              {[
                {
                  severity: "Critical",
                  title: "SQL Injection Vulnerability",
                  location: "src/utils/api.js (line 42)",
                  code: "db.query('SELECT * FROM users WHERE id = ' + userId);"
                },
                {
                  severity: "High",
                  title: "Insecure Authentication",
                  location: "src/components/Auth.js (line 18)",
                  code: "// Password stored in plaintext\nconst userPassword = 'admin123';"
                },
                {
                  severity: "Medium",
                  title: "Cross-Site Scripting",
                  location: "src/components/UserProfile.js (line 75)",
                  code: "element.innerHTML = userInput;"
                }
              ].map((issue, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 flex-shrink-0">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full bg-status-${getSeverityClass(issue.severity)} bg-opacity-20 text-status-${getSeverityClass(issue.severity)} text-xs font-medium`}>
                        {issue.severity.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-text-primary">{issue.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full bg-status-${getSeverityClass(issue.severity)} bg-opacity-20 text-status-${getSeverityClass(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mt-1">{issue.location}</p>
                      <pre className="mt-2 p-2 bg-background-elevated rounded text-sm font-mono overflow-x-auto custom-scrollbar">
                        {issue.code}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" className="px-4 py-2">
                View All Issues (19)
              </Button>
              <Button variant="link" className="px-4 py-2 text-primary">
                Export Full Report
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getSeverityClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
}
