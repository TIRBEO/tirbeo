import {
  MessageCircle, Users, Shield, Zap, MessagesSquare, Library, KanbanSquare, CalendarRange,
  Heart, Lightbulb, Target, Globe, Star, Sparkles, Eye, Fingerprint,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  MessageCircle, Users, Shield, Zap, MessagesSquare, Library, KanbanSquare, CalendarRange,
  Heart, Lightbulb, Target, Globe, Star, Sparkles, Eye, Fingerprint,
};

export function getIcon(name: string | null, fallback: LucideIcon = Sparkles): LucideIcon {
  if (!name) return fallback;
  return iconMap[name] || fallback;
}
