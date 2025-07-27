import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  User, 
  MessageCircle 
} from "lucide-react";

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: BottomNavItem[] = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/discover",
    label: "Discover",
    icon: Search,
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-16 rounded-xl transition-all duration-200 ease-in-out touch-target",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-all duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 