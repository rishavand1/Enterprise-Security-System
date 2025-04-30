import { Shield } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-background-surface py-6 border-t border-background-elevated">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="text-primary text-xl mr-2" />
            <span className="text-text-primary font-medium">NetGuardian</span>
            <span className="text-text-secondary ml-2 text-sm">v1.0.0</span>
          </div>
          <div className="flex space-x-4 text-text-secondary text-sm">
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</div>
            </Link>
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Terms of Service</div>
            </Link>
            <Link href="#">
              <div className="hover:text-primary transition-colors cursor-pointer">Documentation</div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
