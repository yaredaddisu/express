 

const Dashboard = () => {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <header className="bg-white shadow-md p-4 rounded-lg mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          </header>
  

 
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Sales */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800">Total Sales</h2>
              <p className="text-2xl font-bold text-gray-900">$12,345</p>
              <p className="text-gray-600">Compared to last month</p>
            </div>
  
            {/* Card 2: New Users */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800">New Users</h2>
              <p className="text-2xl font-bold text-gray-900">345</p>
              <p className="text-gray-600">New users this month</p>
            </div>
  
            {/* Card 3: Revenue */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800">Revenue</h2>
              <p className="text-2xl font-bold text-gray-900">$7,890</p>
              <p className="text-gray-600">Total revenue generated</p>
            </div>
  
            {/* Card 4: Recent Activities */}
            <div className="bg-white shadow-md rounded-lg p-6 col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activities</h2>
              <ul className="mt-4 space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <p className="text-gray-700">User John Doe signed up.</p>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <p className="text-gray-700">Product XYZ was sold.</p>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <p className="text-gray-700">Payment failed for order #12345.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  