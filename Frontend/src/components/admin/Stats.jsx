// Dashboard stats component
const Stats = ({ stats }) => {
  const { totalUsers, totalProducts, totalOrders, totalRevenue } = stats;
  
  const statItems = [
    {
      id: 1,
      name: 'Total Users',
      value: totalUsers,
      bgColor: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Total Products',
      value: totalProducts,
      bgColor: 'from-slate-500 to-slate-600',
      iconColor: 'text-slate-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 3,
      name: 'Total Orders',
      value: totalOrders,
      bgColor: 'from-emerald-400 to-emerald-500',
      iconColor: 'text-emerald-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: 4,
      name: 'Total Revenue',
      value: `$${(totalRevenue ?? 0).toFixed(2)}`,
      bgColor: 'from-slate-600 to-slate-700',
      iconColor: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat) => (
        <div key={stat.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.name}</h3>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div className={`inline-flex items-center justify-center rounded-2xl p-3 bg-gradient-to-r ${stat.bgColor} shadow-lg`}>
              <div className={`${stat.iconColor.replace('text-', 'text-white')}`}>
                {stat.icon}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${stat.bgColor} bg-opacity-10`}>
              <span className={stat.iconColor}>●</span>
              <span className="ml-1 text-slate-600">Active</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
