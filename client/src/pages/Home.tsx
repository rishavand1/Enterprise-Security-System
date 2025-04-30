import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import PhishingDetection from "@/pages/PhishingDetection";
import FileScanner from "@/pages/FileScanner";
import CodeScanner from "@/pages/CodeScanner";
import DevMode from "@/pages/DevMode";

type Tab = "phishing" | "file-scan" | "code-scan" | "dev-mode";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("phishing");

  return (
    <>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="tab-content">
        {activeTab === "phishing" && <PhishingDetection />}
        {activeTab === "file-scan" && <FileScanner />}
        {activeTab === "code-scan" && <CodeScanner />}
        {activeTab === "dev-mode" && <DevMode />}
      </div>
    </>
  );
}
