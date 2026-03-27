import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Mic,
  FileSearch,
  Play,
  BookOpen,
  Eye,
  User,
  Briefcase,
  Scale,
  Settings2,
  Sparkles,
  Layers,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DemoTab = "stock" | "meeting" | "document" | "match";
type DemoMode = "live" | "guided" | "readonly";
type Persona = "investor" | "pm" | "legal" | "ops";

interface HeaderProps {
  activeTab: DemoTab;
  onTabChange: (tab: DemoTab) => void;
  demoMode: DemoMode;
  onDemoModeChange: (mode: DemoMode) => void;
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const tabs: { id: DemoTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "document", label: "Document Processing", icon: FileSearch },
  { id: "match", label: "Document Matching", icon: Layers },
];

const demoModes: { id: DemoMode; label: string; icon: typeof Play }[] = [
  { id: "live", label: "Live", icon: Play },
  { id: "guided", label: "Guided", icon: BookOpen },
  { id: "readonly", label: "Read-only", icon: Eye },
];

const personas: { id: Persona; label: string; icon: typeof User }[] = [
  { id: "investor", label: "Investor", icon: TrendingUp },
  { id: "pm", label: "Product Manager", icon: Briefcase },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "ops", label: "Operations", icon: Settings2 },
];

export function Header({
  activeTab,
  onTabChange,
  demoMode,
  onDemoModeChange,
  persona,
  onPersonaChange,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setIsDark(!isDark);
  };
  return (
    <header className="glass-panel border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="px-8 py-3">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center">
              <img src="/logo.svg" alt="Document Studio Logo"  />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">Document Studio</h1>
              <p className="text-[11px] text-muted-foreground/80 font-medium">Intelligent Document Processing</p>
            </div>
          </div>

          {/* Right side tab */}
          <div className="flex items-center gap-3">
            <div className="bg-secondary/30 rounded-full p-1 border border-border/40 backdrop-blur-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all duration-300",
                      isActive
                        ? "bg-[#00E5BC] text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-10 w-10 border-border/40 bg-secondary/30 hover:bg-secondary/60 backdrop-blur-sm transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
}
