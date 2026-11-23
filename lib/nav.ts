import { BarChart3, BookOpen, Brain, Egg, FileText, Flower2, Layers, LayoutDashboard, Lightbulb, ListChecks, Settings, Timer, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mastery", label: "Mastery", icon: Flower2 },
  { href: "/quiz", label: "Quiz", icon: ListChecks },
  { href: "/quiz/check", label: "Knowledge check", icon: Brain },
  { href: "/exam", label: "Exam sim", icon: Timer },
  { href: "/flashcards", label: "Memory gym", icon: Layers },
  { href: "/mnemonics", label: "Mnemonics", icon: Lightbulb },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/collection", label: "Cipher cores", icon: Egg },
  { href: "/outline", label: "Exam outline", icon: FileText },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

export const SETTINGS_NAV: NavItem = { href: "/settings", label: "Settings", icon: Settings };

export function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/quiz") return pathname === "/quiz" || (pathname.startsWith("/quiz/") && !pathname.startsWith("/quiz/check"));
  return pathname === href || pathname.startsWith(href + "/");
}
