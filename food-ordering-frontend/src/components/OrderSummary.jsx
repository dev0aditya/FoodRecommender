import React, { useEffect, useState } from "react";
import { saveOrder } from "../api/api";

const OrderSummary = ({
  selectedItems,
  removeFromOrder,
  clearOrder,
  handleLogout, // Receive handleLogout as a prop
}) => {
  const [orderPlaced, setOrderPlaced] = useState(false);

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
      await saveOrder(orderData, token); // Save order to backend
      clearOrder();
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order. Please try again.");
    }
  };

  // Reset orderPlaced state when new items are added
  useEffect(() => {
    if (selectedItems.length > 0 && orderPlaced) {
      setOrderPlaced(false); // Reset the button state
    }
  }, [selectedItems, orderPlaced]);

  return (
    <div className="w-1/6 mt-28">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Order Summary</h1>
          <h4 className=" opacity-70 cursor-pointer border-b border-gray-700 leading-5 w-fit">
            Order history
          </h4>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 absolute top-10 right-12 text-white px-4 py-2 rounded"
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
    </div>
  );
};

export default OrderSummary;
