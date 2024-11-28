import { useState, useEffect } from "react";
import { fetchUserOrders } from "../api/api";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token"); // Retrieve token from local storage

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchUserOrders(token);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    loadOrders();
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-700">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li key={index} className="border p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg">Order #{index + 1}</h2>
              <ul className="mt-2 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} - {item.quantity} x ₹{item.price}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold">Total: ₹{order.total}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
