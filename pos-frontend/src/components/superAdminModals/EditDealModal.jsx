import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import {
  updateDeal,
  getAllItemsOfAdmin,
  getMyCreatedDeals,
} from "../../https/index";

const EditDealModal = ({ isOpen, onClose, onDealUpdated, deal }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dealPrice: "",
    isActive: true,
    validUntil: "",
    items: [],
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [existingDeals, setExistingDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && deal) {
      console.log("deal customization", deal);
      // Populate form with deal data
      setFormData({
        name: deal.name || "",
        description: deal.description || "",
        dealPrice: deal.dealPrice?.toString() || "",
        isActive: deal.isActive !== undefined ? deal.isActive : true,
        validUntil: deal.validUntil
          ? new Date(deal.validUntil).toISOString().slice(0, 16)
          : "",
        items:
          deal.items?.map((item) => ({
            itemId: item.itemId._id || item.itemId,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions || [],
          })) || [],
        customizations: deal.customizations || [],
      });

      if (deal.adminId) {
        fetchItemsForAdmin(deal.adminId._id || deal.adminId);
      }

      // Fetch existing deals for uniqueness validation
      fetchExistingDeals();
    }
  }, [isOpen, deal]);

  const fetchItemsForAdmin = async (adminId) => {
    setIsLoadingItems(true);
    try {
      const response = await getAllItemsOfAdmin(adminId);
      if (response.data?.success) {
        setAvailableItems(response.data.data || []);
      } else {
        setAvailableItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setAvailableItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const fetchExistingDeals = async () => {
    try {
      const response = await getMyCreatedDeals();
      if (response.data?.success) {
        setExistingDeals(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching existing deals:", error);
      setExistingDeals([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Real-time validation for deal name uniqueness
    if (name === "name" && value.trim()) {
      // Exclude current deal from uniqueness check and only check within this admin's deals
      const isDuplicate = existingDeals.some((existingDeal) => {
        const existingDealAdminId =
          existingDeal.adminId?._id || existingDeal.adminId;
        const currentDealAdminId = deal.adminId?._id || deal.adminId;
        return (
          existingDeal._id !== deal._id &&
          existingDealAdminId === currentDealAdminId &&
          existingDeal.name.toLowerCase().trim() === value.toLowerCase().trim()
        );
      });
      if (isDuplicate) {
        setErrors((prev) => ({
          ...prev,
          [name]:
            "Deal name must be unique for this admin. A deal with this name already exists for this restaurant.",
        }));
      } else if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addDealItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemId: "", quantity: 1, selectedOptions: [] }],
    }));
  };

  const updateDealItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeDealItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const toggleItemOption = (itemIndex, option) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === itemIndex) {
          const isSelected = item.selectedOptions.some(
            (opt) => opt.name === option.name
          );
          if (isSelected) {
            return {
              ...item,
              selectedOptions: item.selectedOptions.filter(
                (opt) => opt.name !== option.name
              ),
            };
          } else {
            return {
              ...item,
              selectedOptions: [...item.selectedOptions, option],
            };
          }
        }
        return item;
      }),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    } else {
      // Check if deal name is unique within this admin's deals (exclude current deal)
      const isDuplicate = existingDeals.some((existingDeal) => {
        const existingDealAdminId =
          existingDeal.adminId?._id || existingDeal.adminId;
        const currentDealAdminId = deal.adminId?._id || deal.adminId;
        return (
          existingDeal._id !== deal._id &&
          existingDealAdminId === currentDealAdminId &&
          existingDeal.name.toLowerCase().trim() ===
            formData.name.toLowerCase().trim()
        );
      });
      if (isDuplicate) {
        newErrors.name =
          "Deal name must be unique for this admin. A deal with this name already exists for this restaurant.";
      }
    }

    if (!formData.dealPrice || parseFloat(formData.dealPrice) <= 0) {
      newErrors.dealPrice = "Deal price must be greater than 0";
    }

    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = "Please select an item";
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = "Quantity must be at least 1";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateOriginalPrice = () => {
    // If we have the original price from the deal and items haven't been modified, use it
    if (deal && deal.originalPrice && isItemsUnchanged()) {
      return deal.originalPrice;
    }

    // Otherwise calculate from current items
    return formData.items.reduce((total, dealItem) => {
      const item = availableItems.find((item) => item._id === dealItem.itemId);
      if (item) {
        // Base item price
        let itemTotalPrice = item.price * dealItem.quantity;

        // Add selected options price
        if (dealItem.selectedOptions && dealItem.selectedOptions.length > 0) {
          const optionsPrice = dealItem.selectedOptions.reduce(
            (optTotal, option) => {
              return optTotal + (option.price || 0);
            },
            0
          );
          itemTotalPrice += optionsPrice * dealItem.quantity;
        }

        return total + itemTotalPrice;
      }
      return total;
    }, 0);
  };

  const isItemsUnchanged = () => {
    if (!deal || !deal.items || deal.items.length !== formData.items.length) {
      return false;
    }

    return deal.items.every((originalItem, index) => {
      const currentItem = formData.items[index];
      return (
        currentItem &&
        (originalItem.itemId._id || originalItem.itemId) ===
          currentItem.itemId &&
        originalItem.quantity === currentItem.quantity &&
        JSON.stringify(originalItem.selectedOptions || []) ===
          JSON.stringify(currentItem.selectedOptions || [])
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log("sahfiusad", formData.customizations);

    try {
      const dealData = {
        name: formData.name,
        description: formData.description,
        dealPrice: parseFloat(formData.dealPrice),
        isActive: formData.isActive,
        validUntil: formData.validUntil || undefined,
        items: formData.items.map((item) => ({
          itemId: item.itemId,
          quantity: parseInt(item.quantity),
          selectedOptions: item.selectedOptions || [],
        })),
        customizations: formData.customizations,
      };

      const response = await updateDeal(deal._id, dealData);

      if (response.data?.success) {
        onDealUpdated(response.data.data);
        onClose();
      } else {
        setErrors({
          submit: response.data?.message || "Failed to update deal",
        });
      }
    } catch (error) {
      console.error("Error updating deal:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to update deal",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Update customization (name, minSelect, maxSelect)
  const updateCustomization = (cIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((c, i) =>
        i === cIndex ? { ...c, [field]: value } : c
      ),
    }));
  };

  // Update option (name, price)
  const updateOption = (cIndex, oIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((c, i) =>
        i === cIndex
          ? {
              ...c,
              options: c.options.map((opt, j) =>
                j === oIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : c
      ),
    }));
  };

  // Update subOption (nested level)
  const updateSubOption = (cIndex, oIndex, sIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((c, i) =>
        i === cIndex
          ? {
              ...c,
              options: c.options.map((opt, j) =>
                j === oIndex
                  ? {
                      ...opt,
                      subOptions: opt.subOptions.map((s, k) =>
                        k === sIndex ? { ...s, [field]: value } : s
                      ),
                    }
                  : opt
              ),
            }
          : c
      ),
    }));
  };

  // Add option
  const addOption = (cIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((c, i) =>
        i === cIndex
          ? {
              ...c,
              options: [...c.options, { name: "", price: 0, subOptions: [] }],
            }
          : c
      ),
    }));
  };

  const addCustomization = () => {
  setFormData((prev) => ({
    ...prev,
    customizations: [
      ...(prev.customizations || []),
      {
        name: "",
        minSelect: 0,
        maxSelect: 0,
        options: []
      }
    ]
  }));
};

  // Add subOption
  const addSubOption = (cIndex, oIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((c, i) =>
        i === cIndex
          ? {
              ...c,
              options: c.options.map((opt, j) =>
                j === oIndex
                  ? {
                      ...opt,
                      subOptions: [
                        ...opt.subOptions,
                        { name: "", price: 0, subOptions: [] },
                      ],
                    }
                  : opt
              ),
            }
          : c
      ),
    }));
  };

  const originalPrice = calculateOriginalPrice();
  const savings = originalPrice - parseFloat(formData.dealPrice || 0);

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white">Edit Deal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                    placeholder="Enter deal name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                    placeholder="Enter deal description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Restaurant
                  </label>
                  <input
                    type="text"
                    value={deal.adminId?.name || "Unknown Admin"}
                    disabled
                    className="w-full px-3 py-2 bg-[#404040] border border-[#404040] rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Restaurant cannot be changed when editing
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-300"
                  >
                    Deal is Active
                  </label>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deal Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="dealPrice"
                    value={formData.dealPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                    placeholder="Enter deal price"
                  />
                  {errors.dealPrice && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.dealPrice}
                    </p>
                  )}
                </div>

                {/* Price Summary */}
                {originalPrice > 0 && formData.dealPrice && (
                  <div className="bg-[#262626] p-4 rounded-lg border border-[#404040]">
                    <h4 className="text-white font-medium mb-2">
                      Price Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Original Price:</span>
                        <span className="text-white">
                          Rs {originalPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Original Price Breakdown */}
                      {(() => {
                        const hasOptions = formData.items.some(
                          (item) =>
                            item.selectedOptions &&
                            item.selectedOptions.length > 0
                        );

                        if (hasOptions) {
                          const baseItemsTotal = formData.items.reduce(
                            (total, dealItem) => {
                              const item = availableItems.find(
                                (item) => item._id === dealItem.itemId
                              );
                              return item
                                ? total + item.price * dealItem.quantity
                                : total;
                            },
                            0
                          );

                          const optionsTotal = formData.items.reduce(
                            (total, dealItem) => {
                              return (
                                total +
                                dealItem.selectedOptions.reduce(
                                  (optTotal, option) => {
                                    return (
                                      optTotal +
                                      option.price * dealItem.quantity
                                    );
                                  },
                                  0
                                )
                              );
                            },
                            0
                          );

                          return (
                            <div className="ml-4 space-y-1 text-xs text-gray-400 border-l-2 border-[#404040] pl-3">
                              <div className="flex justify-between">
                                <span>Base Items:</span>
                                <span>Rs {baseItemsTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Selected Options:</span>
                                <span>Rs {optionsTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex justify-between">
                        <span className="text-gray-300">Deal Price:</span>
                        <span className="text-white">
                          Rs {parseFloat(formData.dealPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#404040] pt-1">
                        <span className="text-gray-300">Savings:</span>
                        <span
                          className={
                            savings > 0 ? "text-green-400" : "text-red-400"
                          }
                        >
                          Rs {Math.abs(savings).toFixed(2)}{" "}
                          {savings > 0 ? "saved" : "extra"}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Discount:</span>
                          <span className="text-green-400">
                            {((savings / originalPrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Deal Status */}
                <div className="bg-[#262626] p-4 rounded-lg border border-[#404040]">
                  <h4 className="text-white font-medium mb-2">Deal Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span
                        className={
                          formData.isActive ? "text-green-400" : "text-red-400"
                        }
                      >
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Created:</span>
                      <span className="text-white">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {deal.validUntil && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expires:</span>
                        <span className="text-white">
                          {new Date(deal.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Deal Items *</h3>
                <button
                  type="button"
                  onClick={addDealItem}
                  className="bg-[#60a5fa] text-white px-4 py-2 rounded-lg hover:bg-[#3b82f6] flex items-center gap-2"
                >
                  <FaPlus className="text-sm" />
                  Add Item
                </button>
              </div>

              {errors.items && (
                <p className="text-red-400 text-sm mb-4">{errors.items}</p>
              )}

              {isLoadingItems && (
                <p className="text-gray-400 text-sm mb-4">Loading items...</p>
              )}

              <div className="space-y-3">
                {formData.items.map((dealItem, index) => (
                  <div
                    key={index}
                    className="bg-[#262626] p-4 rounded-lg border border-[#404040]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <select
                          value={dealItem.itemId}
                          onChange={(e) =>
                            updateDealItem(index, "itemId", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                        >
                          <option value="">Select Item</option>
                          {availableItems.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} - Rs {item.price}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}_itemId`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`item_${index}_itemId`]}
                          </p>
                        )}
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={dealItem.quantity}
                          onChange={(e) =>
                            updateDealItem(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                          placeholder="Qty"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`item_${index}_quantity`]}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDealItem(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <FaMinus />
                      </button>
                    </div>

                    {dealItem.itemId && (
                      <div className="mt-3">
                        {(() => {
                          const item = availableItems.find(
                            (item) => item._id === dealItem.itemId
                          );
                          if (!item) return null;

                          const basePrice = item.price * dealItem.quantity;
                          const optionsPrice = dealItem.selectedOptions.reduce(
                            (total, option) => {
                              return total + option.price * dealItem.quantity;
                            },
                            0
                          );

                          return (
                            <div className="space-y-3">
                              <div className="text-sm text-gray-400">
                                <div>Base Price: Rs {basePrice.toFixed(2)}</div>
                                {optionsPrice > 0 && (
                                  <div>
                                    Options: Rs {optionsPrice.toFixed(2)}
                                  </div>
                                )}
                                <div className="font-medium">
                                  Subtotal: Rs{" "}
                                  {(basePrice + optionsPrice).toFixed(2)}
                                </div>
                              </div>

                              {/* Selected Options Display */}
                              {dealItem.selectedOptions &&
                                dealItem.selectedOptions.length > 0 && (
                                  <div className="border-t border-[#404040] pt-3">
                                    <h5 className="text-sm font-medium text-green-400 mb-2">
                                      Selected Options:
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {dealItem.selectedOptions.map(
                                        (option, optIndex) => (
                                          <div
                                            key={optIndex}
                                            className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full"
                                          >
                                            <span className="text-sm text-green-300">
                                              {option.name}
                                            </span>
                                            <span className="text-xs text-green-400">
                                              +Rs{option.price}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleItemOption(index, option)
                                              }
                                              className="text-green-400 hover:text-red-400 transition-colors"
                                              title="Remove option"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Item Options */}
                              {item.options && item.options.length > 0 && (
                                <div className="border-t border-[#404040] pt-3">
                                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                                    Available Options:
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {item.options.map((option, optIndex) => (
                                      <label
                                        key={optIndex}
                                        className="flex items-center space-x-2 p-2 bg-[#1a1a1a] rounded border border-[#404040] cursor-pointer hover:border-[#60a5fa]"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={dealItem.selectedOptions.some(
                                            (opt) => opt.name === option.name
                                          )}
                                          onChange={() =>
                                            toggleItemOption(index, option)
                                          }
                                          className="text-[#60a5fa] focus:ring-[#60a5fa] rounded"
                                        />
                                        <span className="text-sm text-white flex-1">
                                          {option.name}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                          +Rs{option.price}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Customizations */}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formData.items.length === 0 && !isLoadingItems && (
                <p className="text-gray-400 text-center py-8">
                  No items added yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
            {formData.customizations?.map((custom, cIndex) => (
              <div
                key={cIndex}
                className="mt-3 p-3 border rounded bg-[#1a1a1a]"
              >
                <input
                  type="text"
                  value={custom.name}
                  onChange={(e) =>
                    updateCustomization(cIndex, "name", e.target.value)
                  }
                  placeholder="Customization Name"
                  className="w-full mb-2 px-2 py-1 bg-[#262626] text-white rounded"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={custom.minSelect}
                    onChange={(e) =>
                      updateCustomization(
                        cIndex,
                        "minSelect",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="Min"
                    className="w-20 px-2 py-1 bg-[#262626] text-white rounded"
                  />
                  <input
                    type="number"
                    min="0"
                    value={custom.maxSelect}
                    onChange={(e) =>
                      updateCustomization(
                        cIndex,
                        "maxSelect",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="Max"
                    className="w-20 px-2 py-1 bg-[#262626] text-white rounded"
                  />
                </div>

                {/* Options inside customization */}
                {custom.options?.map((opt, oIndex) => (
                  <div
                    key={oIndex}
                    className="mt-3 p-3 bg-[#2a2a2a] rounded flex flex-col gap-2"
                  >
                    {/* Option fields */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) =>
                          updateOption(cIndex, oIndex, "name", e.target.value)
                        }
                        placeholder="Option Name"
                        className="flex-1 px-2 py-1 bg-[#262626] text-white rounded"
                      />
                      <input
                        type="number"
                        value={opt.price}
                        onChange={(e) =>
                          updateOption(
                            cIndex,
                            oIndex,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Price"
                        className="w-28 px-2 py-1 bg-[#262626] text-white rounded"
                      />
                    </div>

                    {/* SubOptions listed below */}
                    <div className="ml-6 flex flex-col gap-2">
                      {opt.subOptions?.map((sub, sIndex) => (
                        <div key={sIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={sub.name}
                            onChange={(e) =>
                              updateSubOption(
                                cIndex,
                                oIndex,
                                sIndex,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="SubOption Name"
                            className="flex-1 px-2 py-1 bg-[#333] text-white rounded"
                          />
                          <input
                            type="number"
                            value={sub.price}
                            onChange={(e) =>
                              updateSubOption(
                                cIndex,
                                oIndex,
                                sIndex,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Price"
                            className="w-28 px-2 py-1 bg-[#333] text-white rounded"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSubOption(cIndex, oIndex)}
                        className="mt-1 px-3 py-1 bg-[#34d399] text-white rounded"
                      >
                        + Add SubOption
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(cIndex)}
                  className="mt-2 px-3 py-1 bg-[#60a5fa] text-white rounded"
                >
                  + Add Option
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addCustomization()}
              className="mt-3 px-3 py-1 bg-[#3b82f6] text-white rounded"
            >
              + Add Customization
            </button>

            {errors.submit && (
              <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
                <p className="text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-[#333]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#60a5fa] text-white rounded-lg hover:bg-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Deal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDealModal;
