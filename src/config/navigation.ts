import type { NavigationItem } from "@/types/navigation";

export const primaryNavigation: NavigationItem[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Procurement", href: "/procurement", icon: "procurement" },
  { label: "Quotations", href: "/quotations", icon: "quotation" },
  { label: "Suppliers", href: "/suppliers", icon: "supplier" },
  { label: "Awards", href: "/awards", icon: "award" },
  { label: "Reports", href: "/reports", icon: "report" },
];

export const secondaryNavigation: NavigationItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
];
