import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

type PhishingAlertProps = {
  url: string;
  reasons: string[];
  onClose: () => void;
};

export default function PhishingAlert({ url, reasons, onClose }: PhishingAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-background-elevated rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">Security Alert</h3>
            <button 
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-center p-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-status-error bg-opacity-20 flex items-center justify-center">
              <AlertCircle className="text-status-error h-10 w-10" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h4 className="text-xl font-semibold text-status-error mb-2">Phishing Detected!</h4>
            <p className="text-text-secondary">This URL appears to be a phishing attempt designed to steal your information.</p>
          </div>
          <div className="bg-background-card p-4 rounded mb-6">
            <h5 className="font-medium text-text-primary mb-2">Suspicious URL</h5>
            <div className="font-mono text-text-secondary text-sm overflow-x-auto whitespace-nowrap custom-scrollbar">
              {url}
            </div>
            <div className="mt-4 space-y-2">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start">
                  <i className="ri-alert-line text-status-error mt-0.5 mr-2"></i>
                  <span className="text-sm text-text-secondary">{reason}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className="flex-grow px-4 py-2.5 bg-status-success hover:bg-green-700 text-white font-medium rounded transition-colors"
              onClick={onClose}
            >
              Return to Safety
            </button>
            <button className="px-4 py-2.5 bg-background-card text-text-primary font-medium rounded hover:bg-background-surface transition-colors">
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
