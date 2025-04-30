import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import PhishingAlert from "@/components/ui/phishing-alert";
import { checkPhishingUrl, getUrlScanHistory } from "@/lib/utils/phishingDetection";

export default function PhishingDetection() {
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [urlHistory, setUrlHistory] = useState<any[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({ url: "", reasons: [] as string[] });
  const [scanResults, setScanResults] = useState<any | null>(null);
  const { toast } = useToast();

  // Load URL history on component mount
  useEffect(() => {
    fetchUrlHistory();
  }, []);

  const fetchUrlHistory = async () => {
    try {
      const history = await getUrlScanHistory(5);
      setUrlHistory(history);
    } catch (error) {
      console.error("Failed to fetch URL history:", error);
    }
  };

  const handleCheckUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to check",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChecking(true);
      const result = await checkPhishingUrl(url);
      
      // Update the URL history
      await fetchUrlHistory();
      
      if (result.isPhishing) {
        setAlertData({
          url: url,
          reasons: result.reasons
        });
        setShowAlert(true);
      } else {
        toast({
          title: "URL is Safe",
          description: "No phishing indicators were detected",
          variant: "default",
        });
      }
      
      setScanResults(result);
    } catch (error) {
      console.error("Error checking URL:", error);
      toast({
        title: "Error",
        description: "Failed to check URL for phishing indicators",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheckUrl();
    }
  };

  return (
    <div className="bg-background-surface rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Phishing Link Detection</h2>
      <p className="text-text-secondary mb-6">Enter a URL to check if it's a potential phishing attempt.</p>
      
      <div className="mb-6">
        <div className="flex">
          <Input
            type="text"
            id="phishing-url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow px-4 py-3 bg-background-card text-black rounded-l-lg border border-background-elevated focus:border-primary"
          />
          <Button
            onClick={handleCheckUrl}
            disabled={isChecking}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-r-lg transition-colors"
          >
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Check URL
          </Button>
        </div>
      </div>

      {urlHistory.length > 0 && (
        <div id="url-history" className="mb-4">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">Recent Checks</h3>
          <div className="space-y-2">
            {urlHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background-card rounded-md">
                <div className="flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full mr-3 ${
                      item.isPhishing ? "bg-status-error" : "bg-status-success"
                    }`}
                  ></div>
                  <span className="text-text-primary">{item.url}</span>
                </div>
                <span 
                  className={`text-sm px-2 py-1 bg-background-elevated rounded ${
                    item.isPhishing ? "text-status-error" : "text-status-success"
                  }`}
                >
                  {item.isPhishing ? "Phishing" : "Safe"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanResults && scanResults.isPhishing && !showAlert && (
        <div id="url-results" className="mt-8 p-4 border border-status-warning bg-background-card rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <i className="ri-error-warning-fill text-2xl text-status-warning"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-text-primary">Potential Phishing Detected</h3>
              <div className="mt-2 text-text-secondary">
                <p>The URL <span className="font-mono bg-background-elevated px-1 py-0.5 rounded">{url}</span> shows signs of phishing:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  {scanResults.reasons.map((reason: string, index: number) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <button 
                  className="px-4 py-2 bg-background-elevated text-text-primary rounded hover:bg-background-surface transition-colors"
                  onClick={() => setShowAlert(true)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <PhishingAlert 
          url={alertData.url} 
          reasons={alertData.reasons} 
          onClose={() => setShowAlert(false)} 
        />
      )}
    </div>
  );
}
