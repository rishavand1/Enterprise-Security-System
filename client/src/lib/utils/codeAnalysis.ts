/**
 * Utility functions for code vulnerability analysis
 */

export interface CodeScanRequest {
  language: string;
  codeSnippet: string;
}

export interface Vulnerability {
  id: number;
  type: string;
  code: string;
  line: number;
  snippet: string;
  recommendation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface CodeScanResult {
  id: number;
  language: string;
  vulnerabilities: Vulnerability[];
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  scannedAt: string;
}

// Scan code for vulnerabilities
export const scanCode = async (scanRequest: CodeScanRequest): Promise<CodeScanResult> => {
  try {
    const response = await fetch('/api/code/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scanRequest),
    });

    if (!response.ok) {
      throw new Error(`Error scanning code: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in code vulnerability scanning:', error);
    throw error;
  }
};

// Get code scan history
export const getCodeScanHistory = async (limit = 10): Promise<any[]> => {
  try {
    const response = await fetch(`/api/code/history?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Error fetching code scan history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching code scan history:', error);
    return [];
  }
};

// Get vulnerability types
export const getVulnerabilityTypes = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/vulnerabilities');

    if (!response.ok) {
      throw new Error(`Error fetching vulnerability types: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching vulnerability types:', error);
    return [];
  }
};
