import re

# Read file
with open(r'c:\Users\Admin\Documents\GitHub\BidBuilder\frontend\src\components\EnhancedHeader.jsx', 'r') as f:
    content = f.read()

# 1. Add Wifi to imports
old_imports = """  Users,
  Menu,
  X,
} from "lucide-react" """

new_imports = """  Users,
  Wifi,
  Menu,
  X,
} from "lucide-react" """

content = content.replace(old_imports, new_imports)

# 2. Add WebSocket navigation item
old_nav = """  const navigationItems = [
    // Dashboard - Only for non-user roles
    ...(userRole !== "user" ? [{ id: "dashboard", label: "Dashboard", icon: BarChart3 }] : []),
    { id: "list", label: "Proposals", icon: FileText },
    // Templates - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "templates", label: "Templates", icon: FileTemplate }] : []),
    // Team - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "team", label: "Team", icon: Users }] : []),
  ]"""

new_nav = """  const navigationItems = [
    // Dashboard - Only for non-user roles
    ...(userRole !== "user" ? [{ id: "dashboard", label: "Dashboard", icon: BarChart3 }] : []),
    { id: "list", label: "Proposals", icon: FileText },
    // Templates - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "templates", label: "Templates", icon: FileTemplate }] : []),
    // Team - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "team", label: "Team", icon: Users }] : []),
    // WebSocket Streaming - Only for managers and admins
    ...(userRole !== "user" ? [{ id: "websocket", label: "WebSocket Streaming", icon: Wifi }] : []),
  ]"""

content = content.replace(old_nav, new_nav)

# Write file back
with open(r'c:\Users\Admin\Documents\GitHub\BidBuilder\frontend\src\components\EnhancedHeader.jsx', 'w') as f:
    f.write(content)

print("✓ EnhancedHeader updated with WebSocket support")
