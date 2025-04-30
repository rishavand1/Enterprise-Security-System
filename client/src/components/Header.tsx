import { Shield, CreditCard, LogOut, User } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-background-surface shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Shield className="text-primary text-2xl" />
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">NetGuardian</h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/subscription">
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-primary text-white rounded-full text-sm cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    <span>Subscriptions</span>
                  </div>
                </Link>
                <div className="hidden sm:flex items-center px-3 py-1.5 bg-background-card rounded-full">
                  <i className="ri-shield-check-line text-status-success mr-2"></i>
                  <span className="text-sm font-medium text-text-primary">Protected</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
