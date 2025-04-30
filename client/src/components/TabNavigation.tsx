import { Link } from "wouter";

type TabProps = {
  activeTab: string;
  onTabChange: (tab: any) => void;
};

export default function TabNavigation({ activeTab, onTabChange }: TabProps) {
  const tabs = [
    { id: "phishing", label: "Phishing Detection", icon: "ri-link-m" },
    { id: "file-scan", label: "File Scanner", icon: "ri-virus-line" },
    { id: "code-scan", label: "Code Vulnerability Scanner", icon: "ri-code-box-line" },
    { id: "dev-mode", label: "Dev Mode", icon: "ri-terminal-box-line" }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-background-elevated">
        <div className="flex overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 font-medium focus:outline-none border-b-2 ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-text-secondary hover:text-text-primary border-transparent"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <i className={`${tab.icon} text-lg mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
