import React from "react";

const FoodMenu = ({ foodItems, addToOrder }) => {
  return (
    <div className="w-10/12">
      <h1 className="text-4xl text-gray-700 font-bold mb-4">Food Menu</h1>
      <div className="btns mb-6 flex gap-3">
        <button className="min-w-32 py-1 font-semibold text-xl rounded bg-blue-500 text-white">
          All
        </button>
        <button className="min-w-32 py-1 font-semibold text-xl rounded bg-blue-500 text-white">
          Main
        </button>
        <button className="min-w-32 py-1 font-semibold text-xl rounded bg-blue-500 text-white">
          Beverage
        </button>
        <button className="min-w-32 py-1 font-semibold text-xl rounded bg-blue-500 text-white">
          Salad
        </button>
        <button className="min-w-32 py-1 font-semibold text-xl rounded bg-blue-500 text-white">
          Our Pick
        </button>
      </div>
      <div className="foodContainer pr-3 max-h-[79vh] overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {foodItems.map((item) => (
          <div
            key={item.id}
            className="border p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => addToOrder(item)} // Add to order on click
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodMenu;
