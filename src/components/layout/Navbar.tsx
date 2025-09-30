import { useAuth } from '../../provider/contexts/AuthContext';
import {  User } from "lucide-react";
export const Navbar: React.FC = () => {
      const { user, logout } = useAuth();
    
return (
<header className="w-full h-16 bg-white border-b flex items-center justify-between px-6">
{/* <h1 className="text-xl font-semibold">Dashboard</h1> */}
<div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Logged in as: <strong>{user?.first_name} {user?.last_name}</strong> {user?.branch && `(Branch: ${user.branch})`}</span>
        </div>
<div className="flex items-center space-x-4">
<button className="p-2 hover:bg-gray-100 rounded-full">
<span className="sr-only">Notifications</span>🔔
</button>
<button className="p-2 hover:bg-gray-100 rounded-full">
<span className="sr-only">Settings</span>⚙️
</button>
<div onClick={logout} className="w-8 h-8 bg-blue-500 cursor-pointer rounded-full flex items-center justify-center text-white font-bold">
J
</div>
</div>
</header>
);
};