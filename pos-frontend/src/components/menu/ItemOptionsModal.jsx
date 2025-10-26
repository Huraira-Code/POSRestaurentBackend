import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTimes } from 'react-icons/fa';

const ItemOptionsModal = ({ item, isOpen, onClose, onAddToCart, quantity = 1 }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [optionQuantities, setOptionQuantities] = useState({}); // Track quantity for each option

  // Reset selected options when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      setSelectedOptions([]);
      setOptionQuantities({});
      setTotalPrice(item.price * quantity);
    }
  }, [isOpen, item, quantity]);

  // Calculate total price when options change
  useEffect(() => {
    if (item) {
      const basePrice = item.price * quantity;
      const optionsPrice = selectedOptions.reduce((total, option) => {
        const optionQty = optionQuantities[option.name] || 1;
        return total + (option.price * optionQty);
      }, 0);
      setTotalPrice(basePrice + optionsPrice);
    }
  }, [selectedOptions, optionQuantities, item, quantity]);

  const handleOptionToggle = (option) => {
    setSelectedOptions(prev => {
      const isSelected = prev.find(opt => opt.name === option.name);
      if (isSelected) {
        // Remove option and its quantity tracking
        setOptionQuantities(prevQty => {
          const newQty = { ...prevQty };
          delete newQty[option.name];
          return newQty;
        });
        return prev.filter(opt => opt.name !== option.name);
      } else {
        // Add option with default quantity of 1
        setOptionQuantities(prevQty => ({
          ...prevQty,
          [option.name]: 1
        }));
        return [...prev, option];
      }
    });
  };

  const handleOptionQuantityChange = (optionName, newQuantity) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, quantity)); // Between 1 and item quantity
    setOptionQuantities(prev => ({
      ...prev,
      [optionName]: clampedQuantity
    }));
  };

  const handleAddToCart = () => {
    if (item) {
      // Create selected options with their quantities
      const optionsWithQuantities = selectedOptions.map(option => ({
        ...option,
        quantity: optionQuantities[option.name] || 1
      }));
      
      const itemWithOptions = {
        ...item,
        selectedOptions: optionsWithQuantities,
        totalPrice,
        originalPrice: item.price
      };
      onAddToCart(itemWithOptions, quantity);
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-[#f5f5f5]">Customize Your Order</h2>
          <button
            onClick={onClose}
            className="text-[#ababab] hover:text-[#f5f5f5] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Item Info */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <h3 className="text-xl font-bold text-[#f5f5f5] mb-2">{item.name}</h3>
          <p className="text-[#ababab] text-sm mb-2">{item.description || 'No description available'}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[#f59e0b]">Base Price: Rs{item.price}</span>
            <span className="text-sm text-[#ababab]">Quantity: {quantity}</span>
          </div>
        </div>

        {/* Options Section */}
        {item.options && item.options.length > 0 && (
          <div className="p-4">
            <h4 className="text-md font-semibold text-[#f5f5f5] mb-3">Available Options:</h4>
            <div className="space-y-3">
              {item.options.map((option, index) => {
                const isSelected = selectedOptions.find(opt => opt.name === option.name);
                const optionQty = optionQuantities[option.name] || 1;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#2e4a40] border border-[#02ca3a]'
                        : 'bg-[#262626] hover:bg-[#2a2a2a] border border-[#404040]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => handleOptionToggle(option)}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#02ca3a] border-[#02ca3a]'
                            : 'border-[#606060]'
                        }`}>
                          {isSelected && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                        <span className="text-[#f5f5f5] font-medium">{option.name}</span>
                      </div>
                      <span className="text-[#f59e0b] font-semibold">Rs{option.price} each</span>
                    </div>
                    
                    {/* Quantity Controls - Only show if option is selected and item quantity > 1 */}
                    {isSelected && quantity > 1 && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#404040]">
                        <span className="text-sm text-[#ababab]">Apply to how many items?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOptionQuantityChange(option.name, optionQty - 1)}
                            disabled={optionQty <= 1}
                            className={`w-6 h-6 rounded border flex items-center justify-center text-sm font-bold ${
                              optionQty <= 1
                                ? 'border-[#404040] text-[#606060] cursor-not-allowed'
                                : 'border-[#02ca3a] text-[#02ca3a] hover:bg-[#02ca3a] hover:text-white'
                            } transition-colors`}
                          >
                            −
                          </button>
                          <span className="text-[#f5f5f5] font-medium min-w-[20px] text-center">
                            {optionQty}
                          </span>
                          <button
                            onClick={() => handleOptionQuantityChange(option.name, optionQty + 1)}
                            disabled={optionQty >= quantity}
                            className={`w-6 h-6 rounded border flex items-center justify-center text-sm font-bold ${
                              optionQty >= quantity
                                ? 'border-[#404040] text-[#606060] cursor-not-allowed'
                                : 'border-[#02ca3a] text-[#02ca3a] hover:bg-[#02ca3a] hover:text-white'
                            } transition-colors`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Show total for this option */}
                    {isSelected && (
                      <div className="text-xs text-[#02ca3a] mt-1">
                        Subtotal: Rs{(option.price * optionQty).toFixed(2)}
                        {quantity > 1 && (
                          <span className="text-[#ababab]"> (Rs{option.price} × {optionQty})</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Options Message */}
        {(!item.options || item.options.length === 0) && (
          <div className="p-4">
            <p className="text-[#ababab] text-center">No additional options available for this item.</p>
          </div>
        )}

        {/* Total and Add to Cart */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-[#f5f5f5]">Total Price:</span>
            <span className="text-xl font-bold text-[#02ca3a]">Rs{totalPrice.toFixed(2)}</span>
          </div>
          
          {selectedOptions.length > 0 && (
            <div className="mb-4 p-3 bg-[#262626] rounded-lg">
              <h5 className="text-sm font-medium text-[#f5f5f5] mb-2">Selected Options:</h5>
              <div className="space-y-1">
                {selectedOptions.map((option, index) => {
                  const optionQty = optionQuantities[option.name] || 1;
                  const optionTotal = option.price * optionQty;
                  return (
                    <div key={index} className="flex justify-between text-xs text-[#ababab]">
                      <span>
                        • {option.name}
                        {quantity > 1 && ` (${optionQty}/${quantity} items)`}
                      </span>
                      <span>Rs{optionTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 bg-[#02ca3a] hover:bg-[#028a30] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FaShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemOptionsModal;
