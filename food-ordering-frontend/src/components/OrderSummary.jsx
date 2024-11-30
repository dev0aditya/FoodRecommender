import React, { useEffect, useState } from "react";
import { saveOrder, fetchUserOrders } from "../api/api"; // Assuming fetchUserOrders API exists
import { toast } from "react-hot-toast"; // Import React Hot Toast

const OrderSummary = ({
  selectedItems,
  removeFromOrder,
  clearOrder,
  handleLogout,
}) => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [orderHistory, setOrderHistory] = useState([]); // Store order history

  const total = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("token");
    const orderData = {
      items: selectedItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: selectedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
    };

    try {
      await saveOrder(orderData, token);
      clearOrder();
      toast.success("Order placed successfully!"); // Show success toast
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order. Please try again."); // Show error toast
    }
  };

  const fetchOrderHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const orders = await fetchUserOrders(token);
      setOrderHistory(orders);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  // Open modal and fetch order history
  const openModal = () => {
    setIsModalOpen(true);
    fetchOrderHistory();
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close modal when clicking on the background
  const handleBackgroundClick = (e) => {
    if (e.target.id === "modalBackground") {
      closeModal();
    }
  };

  useEffect(() => {
    if (selectedItems.length > 0 && orderPlaced) {
      setOrderPlaced(false);
    }
  }, [selectedItems, orderPlaced]);

  return (
    <div className="w-1/6 mt-28">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Order Summary</h1>
          <h4
            className="opacity-70 cursor-pointer border-b border-gray-700 leading-5 w-fit"
            onClick={openModal} // Open the modal on click
          >
            Order history
          </h4>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 absolute top-10 right-24 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {selectedItems.length === 0 ? (
        <p className="text-gray-700 flex justify-center items-center min-h-[59vh]">
          No items in the order.
        </p>
      ) : (
        <ul className="orderContainer pr-4 mb-4 min-h-[59vh] max-h-[59vh] overflow-y-scroll">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border-b py-2"
            >
              <div className="flex flex-col">
                <span className="flex items-center tracking-wide">
                  <span className="font-semibold text-lg">{item.name} </span>
                  <span className="text-gray-600 ml-2">
                    {item.quantity > 1 ? "(" + item.quantity + ")" : ""}
                  </span>
                </span>
                <span className="text-gray-600">₹{item.price}</span>
              </div>
              <button
                onClick={() => removeFromOrder(item.id)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-4">
        <div className="flex justify-between text-lg font-semibold mb-4 items-center">
          <span className="text-2xl font-bold text-gray-700 tracking-wide">
            Total:
          </span>
          <span
            className={`${
              total.toFixed(2) !== "0.00" ? "text-gray-700" : "text-gray-500"
            }`}
          >
            ₹{total.toFixed(2)}
          </span>
        </div>
        <button
          onClick={handlePlaceOrder}
          className={`w-full px-4 py-2 font-semibold text-xl rounded ${
            orderPlaced
              ? "bg-green-500 text-white cursor-not-allowed"
              : "bg-blue-500 text-white"
          }`}
          disabled={orderPlaced}
        >
          {orderPlaced ? "Order Placed Successfully" : "Place Order"}
        </button>
      </div>

      {/* Modal for Order History */}
      {isModalOpen && (
        <div
          id="modalBackground"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white w-3/5 p-6 rounded shadow-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-600 hover:text-black underline"
            >
              close
            </button>
            <h2 className="text-xl font-bold mb-4">Order History</h2>
            {orderHistory.length > 0 ? (
              <ul className="orderContainer pr-3 max-h-96 overflow-y-auto">
                {orderHistory.map((order, index) => (
                  <li
                    key={index}
                    className="mb-4 border p-4 rounded shadow-sm bg-gray-100"
                  >
                    <h3 className="font-semibold mb-2">Order #{index + 1}</h3>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} - {item.quantity} x ₹{item.price}
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold mt-2">Total: ₹{order.total}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
