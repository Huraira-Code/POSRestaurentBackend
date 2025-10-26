import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrolLRef = useRef();
  const dispatch = useDispatch();
  console.log("cart data", cartData);
  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-3 sm:px-4 py-2">
      <h1 className="text-base sm:text-lg text-[#e4e4e4] font-semibold tracking-wide">
        Order Details
      </h1>
      <div
        className="mt-4 overflow-y-scroll scrollbar-hide h-[300px] sm:h-[350px] md:h-[380px]"
        ref={scrolLRef}
      >
        {cartData.length === 0 ? (
          <p className="text-[#ababab] text-sm flex justify-center items-center h-[300px] sm:h-[350px] md:h-[380px] text-center px-2">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          cartData.map((item) => {
            return (
              <div
                className="bg-[#1f1f1f] rounded-lg px-3 sm:px-4 py-3 sm:py-4 mb-2"
                key={item.id}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-[#ababab] font-semibold tracking-wide text-sm sm:text-md truncate">
                      {item.originalName || item.name}
                    </h1>
                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-[#02ca3a] font-medium">
                            Options:
                          </p>
                          {item.selectedOptions.map((option, index) => (
                            <p
                              key={index}
                              className="text-xs text-[#ababab] ml-2"
                            >
                              • {option.name}
                              {option.quantity && option.quantity > 1 && (
                                <span className="text-[#02ca3a]">
                                  {" "}
                                  × {option.quantity}
                                </span>
                              )}
                              <span className="text-[#f59e0b]">
                                {" "}
                                (+Rs{option.price * (option.quantity || 1)})
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                    {item.menuName && (
                      <p className="text-xs text-[#666] mt-1 truncate">
                        📋 Menu: {item.menuName}
                      </p>
                    )}
                  </div>
                  <p className="text-[#ababab] font-semibold text-sm sm:text-base ml-2">
                    x{item.quantity}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-transparent text-[#ababab] rounded-md transition-colors duration-200 border border-white/30"
                      aria-label="Remove item"
                    >
                      <RiDeleteBin2Fill size={14} className="flex-shrink-0" />
                      <span className="text-sm sm:text-base">Remove</span>
                    </button>
                  </div>
                  <p className="text-[#f5f5f5] text-sm sm:text-md font-bold">
                    Rs{item?.price?.toFixed(2) || item.dealPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CartInfo;
