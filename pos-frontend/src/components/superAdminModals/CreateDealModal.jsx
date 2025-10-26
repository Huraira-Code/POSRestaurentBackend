import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import {
  createDeal,
  getAllAdmin,
  getAllItemsOfAdmin,
  getMyCreatedDeals,
} from "../../https/index";

const CreateDealModal = ({
  isOpen,
  onClose,
  onDealCreated,
  preSelectedAdmin,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dealPrice: "",
    adminId: "",
    validUntil: "",
    items: [],
    customizations: [], // 👈 NEW: Added customizations state
  });

  const [admins, setAdmins] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [existingDeals, setExistingDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
      fetchExistingDeals();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.adminId) {
      fetchItemsForAdmin(formData.adminId);
    } else {
      setAvailableItems([]);
    }
  }, [formData.adminId]);

  const fetchAdmins = async () => {
    try {
      const response = await getAllAdmin();
      if (response.data?.success) {
        const adminsList = response.data.data || [];
        setAdmins(adminsList);

        if (preSelectedAdmin && preSelectedAdmin._id) {
          setFormData((prev) => ({
            ...prev,
            adminId: preSelectedAdmin._id,
          }));
        } else if (adminsList.length > 0 && !formData.adminId) {
          setFormData((prev) => ({
            ...prev,
            adminId: adminsList[0]._id,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dealPrice: "",
      adminId: preSelectedAdmin?._id || "",
      validUntil: "",
      items: [],
      customizations: [], // 👈 NEW
    });
    setAvailableItems([]);
    setExistingDeals([]);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name" && value.trim()) {
      const currentAdminId = formData.adminId || preSelectedAdmin?._id;
      const isDuplicate = existingDeals.some((deal) => {
        const dealAdminId = deal.adminId?._id || deal.adminId;
        return (
          dealAdminId === currentAdminId &&
          deal.name.toLowerCase().trim() === value.toLowerCase().trim()
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

  // 👈 NEW: Customization Management Functions
  const addCustomizationOption = (custIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: [
                ...cust.options,
                { name: "", price: 0, subOptions: [] },
              ],
            }
          : cust
      ),
    }));
  };

  const addSubOption = (custIndex, optIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: cust.options.map((opt, j) =>
                j === optIndex
                  ? {
                      ...opt,
                      subOptions: [
                        ...(opt.subOptions || []),
                        { name: "", price: 0, subOptions: [] },
                      ],
                    }
                  : opt
              ),
            }
          : cust
      ),
    }));
  };

  // 👈 NEW: Customization Management Functions
  const addCustomization = () => {
    setFormData((prev) => ({
      ...prev,
      customizations: [
        ...prev.customizations,
        { name: "", minSelect: 0, maxSelect: 1, options: [] },
      ],
    }));
  };

  const updateSubOption = (custIndex, optIndex, subOptIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: cust.options.map((opt, j) =>
                j === optIndex
                  ? {
                      ...opt,
                      subOptions: opt.subOptions.map((sub, k) =>
                        k === subOptIndex ? { ...sub, [field]: value } : sub
                      ),
                    }
                  : opt
              ),
            }
          : cust
      ),
    }));
  };

  const removeSubOption = (custIndex, optIndex, subOptIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: cust.options.map((opt, j) =>
                j === optIndex
                  ? {
                      ...opt,
                      subOptions: opt.subOptions.filter(
                        (_, k) => k !== subOptIndex
                      ),
                    }
                  : opt
              ),
            }
          : cust
      ),
    }));
  };

  const removeCustomization = (index) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.filter((_, i) => i !== index),
    }));
  };

  const updateCustomization = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === index ? { ...cust, [field]: value } : cust
      ),
    }));
  };

  const removeCustomizationOption = (custIndex, optIndex) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: cust.options.filter((_, j) => j !== optIndex),
            }
          : cust
      ),
    }));
  };

  const updateCustomizationOption = (custIndex, optIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((cust, i) =>
        i === custIndex
          ? {
              ...cust,
              options: cust.options.map((opt, j) =>
                j === optIndex ? { ...opt, [field]: value } : opt
              ),
            }
          : cust
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Deal name is required";
    } else {
      const currentAdminId = formData.adminId || preSelectedAdmin?._id;
      const isDuplicate = existingDeals.some((deal) => {
        const dealAdminId = deal.adminId?._id || deal.adminId;
        return (
          dealAdminId === currentAdminId &&
          deal.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
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

    if (!formData.adminId && !preSelectedAdmin) {
      newErrors.adminId = "Please select an admin";
    }

    formData.items.forEach((item, index) => {
      if (!item.itemId) {
        newErrors[`item_${index}_itemId`] = "Please select an item";
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = "Quantity must be at least 1";
      }
    });

    // 👈 NEW: Customization validation
    formData.customizations.forEach((cust, custIndex) => {
      if (!cust.name.trim()) {
        newErrors[`cust_${custIndex}_name`] = "Customization name is required";
      }
      if (cust.minSelect > cust.maxSelect) {
        newErrors[`cust_${custIndex}_range`] =
          "Min selection cannot be more than max selection";
      }
      if (cust.options.length === 0) {
        newErrors[`cust_${custIndex}_options`] =
          "At least one option is required";
      }
      cust.options.forEach((opt, optIndex) => {
        if (!opt.name.trim()) {
          newErrors[`cust_${custIndex}_opt_${optIndex}_name`] =
            "Option name is required";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateOriginalPrice = () => {
    return formData.items.reduce((total, dealItem) => {
      const item = availableItems.find((item) => item._id === dealItem.itemId);
      if (item) {
        const basePrice = item.price * dealItem.quantity;
        const optionsPrice = dealItem.selectedOptions.reduce(
          (optTotal, option) => {
            return optTotal + option.price * dealItem.quantity;
          },
          0
        );
        return total + basePrice + optionsPrice;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const dealData = {
        ...formData,
        adminId: formData.adminId || preSelectedAdmin?._id,
        dealPrice: parseFloat(formData.dealPrice),
        validUntil: formData.validUntil || undefined,
        items: formData.items.map((item) => ({
          itemId: item.itemId,
          quantity: parseInt(item.quantity),
          selectedOptions: item.selectedOptions || [],
        })),
        customizations: formData.customizations.map((cust) => ({
          // 👈 NEW: Added customizations to payload
          name: cust.name,
          minSelect: parseInt(cust.minSelect),
          maxSelect: parseInt(cust.maxSelect),
          options: cust.options,
        })),
      };

      const response = await createDeal(dealData);

      if (response.data?.success) {
        onDealCreated(response.data.data);
        onClose();
      } else {
        setErrors({
          submit: response.data?.message || "Failed to create deal",
        });
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      setErrors({
        submit: error.response?.data?.message || "Failed to create deal",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const originalPrice = calculateOriginalPrice();
  const savings = originalPrice - parseFloat(formData.dealPrice || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white">Create New Deal</h2>
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
                    Admin/Restaurant *
                  </label>
                  {preSelectedAdmin ? (
                    <div>
                      <input
                        type="text"
                        value={`${preSelectedAdmin.name} (${preSelectedAdmin.email})`}
                        disabled
                        className="w-full px-3 py-2 bg-[#404040] border border-[#404040] rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Admin is automatically selected based on current context
                      </p>
                    </div>
                  ) : (
                    <select
                      name="adminId"
                      value={formData.adminId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-white focus:border-[#60a5fa] focus:outline-none"
                    >
                      <option value="">Select Admin</option>
                      {admins.map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.adminId && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.adminId}
                    </p>
                  )}
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
                  disabled={!formData.adminId && !preSelectedAdmin}
                >
                  <FaPlus className="text-sm" />
                  Add Item
                </button>
              </div>

              {errors.items && (
                <p className="text-red-400 text-sm mb-4">{errors.items}</p>
              )}

              {!formData.adminId && !preSelectedAdmin && (
                <p className="text-gray-400 text-sm mb-4">
                  Please select an admin first to add items.
                </p>
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
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formData.items.length === 0 &&
                (formData.adminId || preSelectedAdmin) &&
                !isLoadingItems && (
                  <p className="text-gray-400 text-center py-8">
                    No items added yet. Click "Add Item" to get started.
                  </p>
                )}
            </div>

            {/* --- Deal Customizations --- */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Deal Customizations
                </h3>
                <button
                  type="button"
                  onClick={addCustomization}
                  className="bg-[#60a5fa] text-white px-4 py-2 rounded-lg hover:bg-[#3b82f6] flex items-center gap-2"
                >
                  <FaPlus className="text-sm" />
                  Add Customization
                </button>
              </div>

              <div className="space-y-4">
                {formData.customizations.map((cust, custIndex) => (
                  <div
                    key={custIndex}
                    className="bg-[#262626] p-4 rounded-lg border border-[#404040]"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-semibold text-white">
                        Customization #{custIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeCustomization(custIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTimes />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={cust.name}
                          onChange={(e) =>
                            updateCustomization(
                              custIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white"
                          placeholder="e.g., Toppings"
                        />
                        {errors[`cust_${custIndex}_name`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`cust_${custIndex}_name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Min Select
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cust.minSelect}
                          onChange={(e) =>
                            updateCustomization(
                              custIndex,
                              "minSelect",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Max Select *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={cust.maxSelect}
                          onChange={(e) =>
                            updateCustomization(
                              custIndex,
                              "maxSelect",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white"
                        />
                        {errors[`cust_${custIndex}_range`] && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors[`cust_${custIndex}_range`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customization Options */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-medium text-gray-300">
                          Options *
                        </h5>
                        <button
                          type="button"
                          onClick={() => addCustomizationOption(custIndex)}
                          className="text-[#60a5fa] hover:text-[#3b82f6] text-xs font-semibold flex items-center gap-1"
                        >
                          <FaPlus /> Add Option
                        </button>
                      </div>

                      {errors[`cust_${custIndex}_options`] && (
                        <p className="text-red-400 text-sm mb-2">
                          {errors[`cust_${custIndex}_options`]}
                        </p>
                      )}

                      <div className="space-y-2">
                        {/* Option list */}
                        {cust.options.map((opt, optIndex) => (
                          <div
                            key={optIndex}
                            className="bg-[#1a1a1a] p-3 rounded border border-[#404040] mb-2"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) =>
                                  updateCustomizationOption(
                                    custIndex,
                                    optIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white"
                                placeholder="Option name"
                              />
                              <input
                                type="number"
                                value={opt.price}
                                onChange={(e) =>
                                  updateCustomizationOption(
                                    custIndex,
                                    optIndex,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 px-3 py-2 bg-[#262626] border border-[#404040] rounded text-white"
                                placeholder="Price"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  addSubOption(custIndex, optIndex)
                                }
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                + SubOption
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  removeCustomizationOption(custIndex, optIndex)
                                }
                                className="text-red-400 hover:text-red-300"
                              >
                                <FaMinus />
                              </button>
                            </div>

                            {/* 🔁 SubOptions Recursion */}
                            {opt.subOptions && opt.subOptions.length > 0 && (
                              <div className="ml-6 mt-2 space-y-2">
                                {opt.subOptions.map((sub, subOptIndex) => (
                                  <div
                                    key={subOptIndex}
                                    className="flex items-center gap-3"
                                  >
                                    <input
                                      type="text"
                                      value={sub.name}
                                      onChange={(e) =>
                                        updateSubOption(
                                          custIndex,
                                          optIndex,
                                          subOptIndex,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded text-white"
                                      placeholder="Sub-option name"
                                    />
                                    <input
                                      type="number"
                                      value={sub.price}
                                      onChange={(e) =>
                                        updateSubOption(
                                          custIndex,
                                          optIndex,
                                          subOptIndex,
                                          "price",
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-24 px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded text-white"
                                      placeholder="Price"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeSubOption(
                                          custIndex,
                                          optIndex,
                                          subOptIndex
                                        )
                                      }
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <FaMinus />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {isLoading ? "Creating..." : "Create Deal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDealModal;
