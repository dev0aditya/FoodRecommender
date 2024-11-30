import React, { useState, useEffect } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegThumbsDown } from "react-icons/fa";

const FoodMenu = ({
  foodItems,
  addToOrder,
  selectedCategory,
  setSelectedCategory,
}) => {
  const [interactions, setInteractions] = useState({});
  const [recommendedItems, setRecommendedItems] = useState([]); // State for recommendations

  // Fetch likes/dislikes for each food item
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/food-items/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await response.json();
        const interactionState = data.reduce((acc, item) => {
          acc[item.id] = item.user_interaction;
          return acc;
        }, {});
        setInteractions(interactionState);
      } catch (error) {
        console.error("Error fetching interactions:", error);
      }
    };

    fetchInteractions();
  }, []);

  // Fetch recommended items
  useEffect(() => {
    if (selectedCategory === "We Rec") {
      const fetchRecommendations = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            "http://127.0.0.1:8000/api/recommendations_ml/",
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
          const data = await response.json();
          setRecommendedItems(data); // Store recommended items
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        }
      };

      fetchRecommendations();
    }
  }, [selectedCategory]);

  const handleLike = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is missing");

      // Check if the current state is "like"
      if (interactions[itemId] === "like") {
        // Remove the like
        await fetch(`http://127.0.0.1:8000/api/food/${itemId}/like/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setInteractions((prev) => ({ ...prev, [itemId]: null }));
      } else {
        // Add a like
        await fetch(`http://127.0.0.1:8000/api/food/${itemId}/like/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setInteractions((prev) => ({ ...prev, [itemId]: "like" }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDislike = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is missing");

      // Check if the current state is "dislike"
      if (interactions[itemId] === "dislike") {
        // Remove the dislike
        await fetch(`http://127.0.0.1:8000/api/food/${itemId}/dislike/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setInteractions((prev) => ({ ...prev, [itemId]: null }));
      } else {
        // Add a dislike
        await fetch(`http://127.0.0.1:8000/api/food/${itemId}/dislike/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setInteractions((prev) => ({ ...prev, [itemId]: "dislike" }));
      }
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };

  const filteredItems =
    selectedCategory === "All"
      ? foodItems
      : selectedCategory === "We Rec"
      ? recommendedItems
      : foodItems.filter((item) => item.category === selectedCategory);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="w-10/12">
      <h1 className="text-4xl text-gray-700 font-bold mb-4">Food Menu</h1>
      <div className="btns mb-6 flex gap-3">
        {["All", "Main", "Beverage", "Salad", "We Rec"].map((category) => (
          <button
            key={category}
            className={`min-w-32 py-1 font-semibold text-xl rounded ${
              selectedCategory === category
                ? "bg-blue-700 text-white"
                : "bg-blue-500 text-white"
            }`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="foodContainer pr-3 max-h-[79vh] min-h-[79vh] overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer h-fit"
              onClick={() => addToOrder(item)}
            >
              {item.image ? (
                <img
                  src={`http://127.0.0.1:8000${item.image}`}
                  alt={item.name}
                  className="w-full h-40 object-cover mb-2 rounded"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center mb-2 rounded">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-700 capitalize">
                Category: {item.category}
              </p>
              <p className="text-gray-900 font-bold">Price: ₹{item.price}</p>
              <div className="flex justify-between mt-2">
                <button
                  className={`flex items-center gap-1 ${
                    interactions[item.id] === "like"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(item.id);
                  }}
                >
                  <AiOutlineLike />
                  Like
                </button>
                <button
                  className={`flex items-center gap-1 ${
                    interactions[item.id] === "dislike"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDislike(item.id);
                  }}
                >
                  <FaRegThumbsDown />
                  Dislike
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No items available in this category.</p>
        )}
      </div>
    </div>
  );
};

export default FoodMenu;
