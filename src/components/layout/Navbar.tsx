import { useAuth } from '../../provider/contexts/AuthContext';

export const Navbar: React.FC = () => {
      const {  logout } = useAuth();
    
return (
<header className="w-full h-16 bg-white border-b flex items-center justify-between px-6">
<h1 className="text-xl font-semibold">Dashboard</h1>
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