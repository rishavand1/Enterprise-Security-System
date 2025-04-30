import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { scanCode } from "@/lib/utils/codeAnalysis";
import { Vulnerability } from "@shared/schema";

export default function CodeScanner() {
  const [language, setLanguage] = useState("javascript");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    vulnerabilities: Vulnerability[];
    totalIssues: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  } | null>(null);
  const { toast } = useToast();

  const handleAnalyzeCode = async () => {
    if (!codeSnippet.trim()) {
      toast({
        title: "No Code Provided",
        description: "Please enter some code to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const scanResult = await scanCode({
        language,
        codeSnippet
      });
      
      setResults({
        vulnerabilities: scanResult.vulnerabilities,
        totalIssues: scanResult.totalIssues,
        criticalCount: scanResult.criticalCount,
        highCount: scanResult.highCount,
        mediumCount: scanResult.mediumCount,
        lowCount: scanResult.lowCount
      });
      
      if (scanResult.totalIssues > 0) {
        toast({
          title: "Vulnerabilities Detected",
          description: `Found ${scanResult.totalIssues} potential ${scanResult.totalIssues === 1 ? 'issue' : 'issues'}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Analyzed",
          description: "No vulnerabilities were detected",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error analyzing code:", error);
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the code",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setCodeSnippet("");
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical':
        return 'text-status-error';
      case 'High':
        return 'text-status-error';
      case 'Medium':
        return 'text-status-warning';
      case 'Low':
        return 'text-status-info';
      default:
        return 'text-text-primary';
    }
  };

  const getSeverityBorderColor = (severity: string): string => {
    switch (severity) {
      case 'Critical':
      case 'High':
        return 'border-status-error';
      case 'Medium':
        return 'border-status-warning';
      case 'Low':
        return 'border-status-info';
      default:
        return 'border-background-elevated';
    }
  };

  return (
    <div className="bg-background-surface rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">OWASP Top 10 Code Vulnerability Scanner</h2>
      <p className="text-text-secondary mb-6">Paste your code to analyze for common security vulnerabilities.</p>

      {!results && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="code-language" className="text-sm font-medium text-text-secondary">Language</label>
            <div className="relative">
              <Select 
                value={language} 
                onValueChange={setLanguage}
              >
                <SelectTrigger className="bg-background-card text-text-primary text-sm rounded px-3 py-1.5 w-[150px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            id="code-input"
            className="w-full p-4 bg-background-card text-black font-mono rounded border border-background-elevated focus:border-primary min-h-[200px] resize-vertical custom-scrollbar"
            placeholder="// Paste your code here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        </div>
      )}

      {!results && (
        <div className="flex justify-end mb-8">
          <Button
            onClick={handleAnalyzeCode}
            disabled={isAnalyzing}
            className="px-6 py-2.5"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Analyze Code
          </Button>
        </div>
      )}

      {results && (
        <div id="code-analysis-results">
          <div className="p-4 bg-background-card rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Analysis Results</h3>
              <div className="flex items-center">
                {results.totalIssues > 0 ? (
                  <>
                    {results.criticalCount + results.highCount > 0 && (
                      <span className="px-3 py-1 bg-background-elevated text-status-error rounded-full text-sm font-medium mr-2">
                        {results.criticalCount + results.highCount} Critical/High
                      </span>
                    )}
                    {results.mediumCount > 0 && (
                      <span className="px-3 py-1 bg-background-elevated text-status-warning rounded-full text-sm font-medium mr-2">
                        {results.mediumCount} Medium
                      </span>
                    )}
                    {results.lowCount > 0 && (
                      <span className="px-3 py-1 bg-background-elevated text-status-info rounded-full text-sm font-medium">
                        {results.lowCount} Low
                      </span>
                    )}
                  </>
                ) : (
                  <span className="px-3 py-1 bg-background-elevated text-status-success rounded-full text-sm font-medium">
                    No Issues
                  </span>
                )}
              </div>
            </div>

            {results.vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {results.vulnerabilities.map((vuln, index) => (
                  <div 
                    key={index} 
                    className={`border-l-4 ${getSeverityBorderColor(vuln.severity)} p-4 bg-background-elevated rounded-r-lg`}
                  >
                    <div className="flex items-start">
                      <i className={`ri-error-warning-fill ${getSeverityColor(vuln.severity)} text-xl mt-0.5 mr-3`}></i>
                      <div>
                        <h4 className="font-medium text-text-primary">{vuln.type} ({vuln.code})</h4>
                        <div className="mt-1 text-sm text-text-secondary">
                          <p>Line {vuln.line}: {vuln.snippet}</p>
                          <div className="mt-2">
                            <span className="font-medium text-text-primary">Recommendation:</span>
                            <p className="mt-1">{vuln.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-background-elevated rounded-lg text-center">
                <i className="ri-check-double-line text-status-success text-3xl mb-2"></i>
                <p className="text-text-primary">Your code looks secure! No OWASP Top 10 vulnerabilities detected.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {}} // Export report functionality would go here
              className="px-4 py-2"
            >
              Export Report
            </Button>
            <Button 
              variant="link" 
              onClick={resetAnalysis}
              className="px-4 py-2 text-primary"
            >
              Scan New Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
