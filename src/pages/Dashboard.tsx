// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../provider/contexts/AuthContext';
import { api } from '../services/api'; 
interface DashboardData {
  // Define the structure of your dashboard data
  message: string;
  data: any;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

    const stats = [
{ label: "Total Deposits", value: "$2.5M" },
{ label: "Loans", value: "$1.2M" },
{ label: "Transactions", value: "1,450" },
{ label: "Pending Approvals", value: "12" },
];


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/testProtectedRoute');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  if (loading) {
    return <div>Loading data...</div>;
  }



  return (
   <>
<main className="flex-1 p-6 bg-gray-50">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
{stats.map((stat) => (
<div
key={stat.label}
className="bg-white p-4 rounded-xl shadow-sm border"
>
<h3 className="text-gray-500 text-sm">{stat.label}</h3>
<p className="text-2xl font-semibold mt-2">{stat.value}</p>
</div>
))}
</div>


<div className="bg-white p-6 rounded-xl shadow-sm border">
<h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
<table className="w-full text-left border-collapse">
<thead>
<tr className="text-gray-500 border-b">
<th className="p-2">Date</th>
<th className="p-2">Customer</th>
<th className="p-2">Amount</th>
<th className="p-2">Status</th>
</tr>
</thead>
<tbody>
<tr className="border-b">
<td className="p-2">08/11/2022</td>
<td className="p-2">John Doe</td>
<td className="p-2">$2,200</td>
<td className="p-2 text-green-600">Completed</td>
</tr>
<tr className="border-b">
<td className="p-2">06/23/2022</td>
<td className="p-2">Jane Smith</td>
<td className="p-2">$2,100</td>
<td className="p-2 text-yellow-500">Pending</td>
</tr>
</tbody>
</table>
</div>
</main>

    <div className="min-h-screen  text-black font-mono px-8">

      <div className='flex items-start space-x-8'>
     
      </div>
    <div>
      <h1>Welcome, {user?.first_name}! {JSON.stringify(user, null, 2)}</h1>
      <button onClick={logout}>Logout</button>
      
      <div>
        <h2>Your Data</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
    </div>
    </>
  );
};

export default Dashboard;