/**
 * Utility functions for phishing detection
 */

// Checks if a URL is potentially a phishing URL
export interface PhishingCheckResult {
  isPhishing: boolean;
  reasons: string[];
}

export const checkPhishingUrl = async (url: string): Promise<PhishingCheckResult> => {
  try {
    const response = await fetch('/api/phishing/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Error checking URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in phishing detection:', error);
    return {
      isPhishing: false,
      reasons: ['Error processing URL check'],
    };
  }
};

// Get URL scan history
export const getUrlScanHistory = async (limit = 10): Promise<any[]> => {
  try {
    const response = await fetch(`/api/phishing/history?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Error fetching URL history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching URL scan history:', error);
    return [];
  }
};
