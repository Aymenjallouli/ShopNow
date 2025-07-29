// Dashboard stats component
const Stats = ({ stats }) => {
  const { totalUsers, totalProducts, totalOrders, totalRevenue } = stats;
  
  const statItems = [
    {
      id: 1,
      name: 'Total Users',
      value: totalUsers,
      bgColor: 'bg-blue-500',
    },
    {
      id: 2,
      name: 'Total Products',
      value: totalProducts,
      bgColor: 'bg-green-500',
    },
    {
      id: 3,
      name: 'Total Orders',
      value: totalOrders,
      bgColor: 'bg-yellow-500',
    },
    {
      id: 4,
      name: 'Total Revenue',
      value: `$${(totalRevenue ?? 0).toFixed(2)}`,
      bgColor: 'bg-purple-500',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <div key={stat.id} className="bg-white rounded-lg shadow p-6">
          <div className={`inline-flex items-center justify-center rounded-full p-3 ${stat.bgColor} bg-opacity-20 mb-4`}>
            <div className={`rounded-full p-2 ${stat.bgColor}`}></div>
          </div>
          <h3 className="text-lg font-medium text-gray-700">{stat.name}</h3>
          <p className="text-3xl font-semibold mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Stats;
