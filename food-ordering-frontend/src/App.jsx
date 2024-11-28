import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import FoodMenu from "./components/FoodMenu";
import OrderSummary from "./components/OrderSummary";
import Login from "./components/Login";
import { fetchFoodItems } from "./api/api";
import Register from "./components/Register";
import OrderHistory from "./components/OrderHistory";

const App = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || ""); // Authentication token

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

  return (
    <Router>
      <div className="min-h-screen bg-[#fffdf6] py-10 px-12">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex gap-8">
                  <FoodMenu foodItems={foodItems} addToOrder={addToOrder} />
                  <OrderSummary
                    selectedItems={Object.values(selectedItems)}
                    removeFromOrder={removeFromOrder}
                    clearOrder={clearOrder}
                    handleLogout={handleLogout} // Pass handleLogout as a prop
                  />
                </div>
                {/* <OrderHistory /> */}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
