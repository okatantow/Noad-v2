import { useState } from "react";
import {
  Home,
  Users,
  FileText,
  Banknote,
  Settings,
  Layers,
  Briefcase,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-4 font-bold text-lg">Okatat’s Rural Bank</div>
      <nav className="flex-1 px-2 space-y-2">
        <SidebarItem icon={<Home size={18} />} label="Dashboard" />
        <SidebarItem icon={<Briefcase size={18} />} label="Cashier" />

        {/* Collapsible group */}
        <SidebarGroup
          icon={<Users size={18} />}
          label="Customer"
          subItems={[
            "Customer Details",
            "Accounts",
            "Statements",
            "Account List",
            "Customer List",
          ]}
        />

        <SidebarItem icon={<Banknote size={18} />} label="Loans" />
        <SidebarItem icon={<Layers size={18} />} label="Accountant" />
        <SidebarItem icon={<Settings size={18} />} label="System Manager" />
        <SidebarItem icon={<FileText size={18} />} label="Bank" />
      </nav>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
    {icon}
    <span>{label}</span>
  </div>
);

const SidebarGroup = ({
  icon,
  label,
  subItems,
}: {
  icon: React.ReactNode;
  label: string;
  subItems: string[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Group Header */}
      <div
        className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {/* Submenu with animation */}
      <div
        className={`ml-6 overflow-hidden transition-all duration-300 ${
          open ? "max-h-40" : "max-h-0"
        }`}
      >
        {subItems.map((item, i) => (
          <SidebarSubItem key={i} label={item} />
        ))}
      </div>
    </div>
  );
};

const SidebarSubItem = ({ label }: { label: string }) => (
  <div className="p-1 text-sm text-gray-600 hover:text-black cursor-pointer">
    {label}
  </div>
);
