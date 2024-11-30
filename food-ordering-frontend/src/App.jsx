import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast"; // Import React Hot Toast
import FoodMenu from "./components/FoodMenu";
import OrderSummary from "./components/OrderSummary";
import Login from "./components/Login";
import { fetchFoodItems } from "./api/api";
import Register from "./components/Register";

const App = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || ""); // Authentication token
  const [selectedCategory, setSelectedCategory] = useState("All"); // Lifted state for category
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [isLoading, setIsLoading] = useState(false); // Track loading state for the button

  useEffect(() => {
    const loadFoodItems = async () => {
      try {
        if (token) {
          const data = await fetchFoodItems(token);
          setFoodItems(data);
        }
      } catch (error) {
        console.error(
          "Error fetching food items:",
          error.response?.data || error.message
        );
      }
    };
    loadFoodItems();
  }, [token]);

  const clearOrder = () => {
    setSelectedItems({});
  };

  const addToOrder = (item) => {
    setSelectedItems((prev) => {
      const updatedItems = { ...prev };
      if (updatedItems[item.id]) {
        updatedItems[item.id].quantity += 1;
      } else {
        updatedItems[item.id] = { ...item, quantity: 1 };
      }
      return updatedItems;
    });
  };

  const removeFromOrder = (id) => {
    setSelectedItems((prev) => {
      const updatedItems = { ...prev };
      if (updatedItems[id].quantity > 1) {
        updatedItems[id].quantity--;
      } else {
        delete updatedItems[id];
      }
      return updatedItems;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    setToken(""); // Reset token in state
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false); // Reset loading state when modal is closed
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData(e.target);

    setIsLoading(true); // Set loading state
    try {
      await fetch("https://formsubmit.co/f2695df9dce43b355a5fa7fe5179c381", {
        method: "POST",
        body: formData,
      });

      // Close modal and show toast notification
      setIsLoading(false);
      closeModal();
      toast.success("Message sent successfully!"); // Display toast
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
      toast.error("Failed to send the message. Please try again.");
    }
  };

  return (
    <Router>
      <div className="relative bg-[#fffdf6]">
        <Toaster position="top-center" reverseOrder={false} />{" "}
        {/* Add Toaster */}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex gap-8 py-10 px-12">
                  <FoodMenu
                    foodItems={foodItems}
                    addToOrder={addToOrder}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory} // Pass state and updater
                  />
                  <OrderSummary
                    selectedItems={Object.values(selectedItems)}
                    removeFromOrder={removeFromOrder}
                    clearOrder={clearOrder}
                    handleLogout={handleLogout}
                  />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        <div
          className="cursor-pointer absolute right-12 top-10 rounded-full text-xl w-10 h-10 flex justify-center items-center bg-blue-500"
          onClick={openModal} // Open modal on click
        >
          🗨️
        </div>
        {/* Modal */}
        {isModalOpen && (
          <dialog
            className="modal fixed  w-full h-full inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            open
            onClick={(e) => {
              if (e.target.classList.contains("modal")) closeModal(); // Close modal on background click
            }}
          >
            <div className="bg-[#fffdf6] w-1/3 p-6 rounded-lg shadow-lg relative">
              {/* Close button */}
              <button
                className="absolute top-3 right-4 underline text-gray-600 hover:text-black"
                onClick={closeModal}
              >
                close
              </button>
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="Subject"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="Enter subject"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="Message"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows="4"
                    placeholder="Enter your message"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? "Loading..." : "Submit"}{" "}
                  {/* Button text changes */}
                </button>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </Router>
  );
};

export default App;
