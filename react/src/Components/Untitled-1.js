    {/* <pre>{JSON.stringify(user.role, null, 2)};
    </pre> */}
    {user.role === "2" || user.role === "1" && (
    <div className="form-actions w-full max-w-xs">
        <Link 
            className="w-full block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out text-center"
            to={`/orders/${id}`}
        >
            View Order
        </Link>
    </div>
    )}
        {user.role === "3" && (
   <div className="form-actions w-full max-w-xs">
        <Link 
            className="w-full block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out text-center"
            to={`/order-by-slug/${id}`}
        >
            View Order
        </Link>
    </div>
        )}