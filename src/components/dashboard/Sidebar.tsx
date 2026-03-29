'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  TrendingUp,
  FileBarChart,
  Settings,
  Database,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/dashboard/accounts', icon: Building2 },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Opportunities', href: '/dashboard/opportunities', icon: TrendingUp },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Enterprise</h1>
          <p className="text-xs text-gray-400">Dataverse Dashboard</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Connected to</p>
          <p className="text-sm font-medium truncate">Microsoft Dataverse</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
