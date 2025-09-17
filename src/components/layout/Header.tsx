export const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow">
      <div className="text-gray-600 uppercase tracking-wide">User Cashier</div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Logged in as : <b>Joseph</b></span>
        <img
          src="https://i.pravatar.cc/40"
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
};
