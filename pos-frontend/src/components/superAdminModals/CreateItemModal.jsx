import React, { useState, useEffect } from "react";
import {
  createItem,
  getCategoriesForAdmin,
  importItems,
  assignCategoriesToImportedItems,
  getAllItemsOfAdmin,
} from "../../https/index";

const CreateItemModal = ({
  isOpen,
  onClose,
  onSuccess,
  allAdmins = [],
  createdUser = null,
  isLoadingAdmins = false,
  selectedAdmin = null,
  onItemCreated = null, // New callback for refreshing admin items
  onCategoryCreated = null, // New callback for refreshing admin categories
  onImportSuccess = null, // New callback for showing import success notifications
  isSetupWizard = false, // New prop to indicate Setup Wizard context
  isSettings = false, // New prop to indicate Settings context
  adminCategories = [], // Categories passed from parent
  isLoadingCategories = false, // Loading state passed from parent
}) => {
  const [itemFormData, setItemFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    options: [],
    adminId: "",
    tax: {
      cash: "",
      card: "",
    },
    discount: "",
  });
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [itemCreationError, setItemCreationError] = useState("");
  const [itemCreationSuccess, setItemCreationSuccess] = useState("");
  const [localAdminCategories, setLocalAdminCategories] = useState([]);
  const [isLoadingLocalCategories, setIsLoadingLocalCategories] =
    useState(false);

  // Combine both category sources and remove duplicates
  const currentCategories = (() => {
    const allCategories = [...adminCategories, ...localAdminCategories];
    // Remove duplicates based on _id
    const uniqueCategories = allCategories.reduce((acc, category) => {
      if (!acc.find((c) => c._id === category._id)) {
        acc.push(category);
      }
      return acc;
    }, []);
    return uniqueCategories;
  })();
  const currentLoadingCategories =
    isLoadingCategories || isLoadingLocalCategories;

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Option management states
  const [showAddOption, setShowAddOption] = useState(false);
  const [optionFormData, setOptionFormData] = useState({
    name: "",
    price: "",
    option: false, // Add this field to track if the option is active
  });
  const [optionError, setOptionError] = useState("");

  // Import items states
  const [showImportSection, setShowImportSection] = useState(false);
  const [importFromAdminId, setImportFromAdminId] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [availableAdminsForImport, setAvailableAdminsForImport] = useState([]);
  const [importedItems, setImportedItems] = useState([]);
  const [showCategoryAssignment, setShowCategoryAssignment] = useState(false);
  const [categoryAssignments, setCategoryAssignments] = useState({});
  const [isAssigningCategories, setIsAssigningCategories] = useState(false);

  // Reset form when modal opens and pre-select admin if selectedAdmin is provided
  useEffect(() => {
    if (isOpen) {
      const preselectedAdminId =
        isSetupWizard && createdUser
          ? createdUser.id
          : selectedAdmin?._id || "";
      setItemFormData({
        name: "",
        price: "",
        categoryId: "",
        options: [],
        adminId: preselectedAdminId,
        tax: {
          cash: "",
          card: "",
        },
        discount: "",
      });
      setItemCreationError("");
      setItemCreationSuccess("");
      setLocalAdminCategories([]);

      // Reset image states
      setSelectedImage(null);
      setImagePreview("");
      setIsUploadingImage(false);

      // Reset option form states
      setShowAddOption(false);
      setOptionFormData({
        name: "",
        price: "",
        option: false, // Reset to true
      });
      setOptionError("");

      // Reset import states
      setShowImportSection(false);
      setImportFromAdminId("");
      setImportError("");
      setImportSuccess("");
      setImportedItems([]);
      setShowCategoryAssignment(false);
      setCategoryAssignments({});

      // Set available admins for import (exclude the target admin)
      if (preselectedAdminId) {
        const filteredAdmins = allAdmins.filter(
          (admin) => admin._id !== preselectedAdminId
        );
        setAvailableAdminsForImport(filteredAdmins);
      } else {
        setAvailableAdminsForImport(allAdmins);
      }

      // If we have a preselected admin and no passed categories, fetch categories immediately
      if (preselectedAdminId && adminCategories.length === 0) {
        fetchCategoriesForAdmin(preselectedAdminId);
      }
    }
  }, [
    isOpen,
    selectedAdmin,
    isSetupWizard,
    isSettings,
    createdUser,
    allAdmins,
  ]);

  // Watch for adminCategories changes and refresh local categories if needed
  useEffect(() => {
    // If adminCategories are provided and we have a selected admin,
    // but currentCategories is using localAdminCategories and it's empty,
    // then fetch local categories to ensure we have the latest data
    if (
      adminCategories.length === 0 &&
      selectedAdmin &&
      localAdminCategories.length === 0 &&
      !isLoadingLocalCategories
    ) {
      fetchCategoriesForAdmin(selectedAdmin._id);
    }
  }, [
    adminCategories,
    selectedAdmin,
    localAdminCategories.length,
    isLoadingLocalCategories,
  ]);

  // Fetch categories for specific admin (only used when categories aren't passed from parent)
  const fetchCategoriesForAdmin = async (adminId) => {
    if (!adminId) {
      setLocalAdminCategories([]);
      return;
    }

    setIsLoadingLocalCategories(true);
    try {
      const response = await getCategoriesForAdmin(adminId);
      if (response.data?.success) {
        setLocalAdminCategories(response.data.data || []);
      } else {
        setLocalAdminCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories for admin:", error);
      setLocalAdminCategories([]);
    } finally {
      setIsLoadingLocalCategories(false);
    }
  };

  const handleItemFormChange = (e) => {
    const { name, value } = e.target;

    // Handle nested tax object fields
    if (name === "taxCash" || name === "taxCard") {
      const taxField = name === "taxCash" ? "cash" : "card";
      setItemFormData((prev) => ({
        ...prev,
        tax: {
          ...prev.tax,
          [taxField]: value,
        },
      }));
    } else {
      setItemFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Fetch categories when admin is selected (only if not passed from parent)
    if (name === "adminId" && value && adminCategories.length === 0) {
      fetchCategoriesForAdmin(value);
      // Reset category selection when admin changes
      setItemFormData((prev) => ({
        ...prev,
        categoryId: "",
      }));
    }

    // Clear error when user starts typing
    if (itemCreationError) {
      setItemCreationError("");
    }
  };

  // Image handling functions
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setItemCreationError(
          "Please select a valid image file (JPG, PNG, GIF, WebP)"
        );
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setItemCreationError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      setItemCreationError("");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    // Reset the file input
    const fileInput = document.getElementById("item-image-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Option management functions
  const handleOptionFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox differently
    if (type === "checkbox") {
      setOptionFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setOptionFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (optionError) {
      setOptionError("");
    }
  };

  const handleAddOption = () => {
    // Reset option error
    setOptionError("");

    // Validate option fields
    const { name, price } = optionFormData;
    if (!name || !price) {
      setOptionError("Both option name and price are required");
      return;
    }

    // Validate option name
    if (name.trim().length < 2) {
      setOptionError("Option name must be at least 2 characters long");
      return;
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) < 0) {
      setOptionError("Please enter a valid price (0 or greater)");
      return;
    }

    // Check if option with same name already exists
    const existingOption = itemFormData.options.find(
      (opt) => opt.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingOption) {
      setOptionError("An option with this name already exists");
      return;
    }

    // Add option to the item (include the active status)
    const newOption = {
      name: name.trim(),
      price: parseFloat(price),
      option: optionFormData.option, // Include the active status
    };

    setItemFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));

    // Reset option form
    setOptionFormData({
      name: "",
      price: "",
      option: false, // Reset to true
    });

    // Hide add option form
    setShowAddOption(false);
  };

  const handleRemoveOption = (index) => {
    setItemFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleToggleAddOption = () => {
    setShowAddOption(!showAddOption);
    setOptionError("");
    setOptionFormData({
      name: "",
      price: "",
      option: false, // Reset to true when toggling
    });
  };

  const handleCreateItem = async () => {
    // Reset any previous errors or success messages
    setItemCreationError("");
    setItemCreationSuccess("");

    // Validate required fields
    const { name, price, categoryId, adminId, tax } = itemFormData;
    if (!name || !price || !categoryId || !adminId) {
      setItemCreationError("Please fill in all required fields");
      return;
    }

    // Validate tax fields
    if (!tax.cash || !tax.card) {
      setItemCreationError("Both cash and card tax rates are required");
      return;
    }

    // Validate image upload
    if (!selectedImage) {
      setItemCreationError("Please select an image for the item");
      return;
    }

    // Validate item name
    if (name.trim().length < 2) {
      setItemCreationError("Item name must be at least 2 characters long");
      return;
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) <= 0) {
      setItemCreationError("Please enter a valid price greater than 0");
      return;
    }

    setIsCreatingItem(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", parseFloat(price));
      formData.append("categoryId", categoryId);
      formData.append("adminId", adminId);
      formData.append("options", JSON.stringify(itemFormData.options));
      formData.append("pictureURL", selectedImage); // Use 'pictureURL' to match backend

      // Add tax object as JSON string if both cash and card are provided
      if (itemFormData.tax.cash && itemFormData.tax.card) {
        formData.append(
          "tax",
          JSON.stringify({
            cash: itemFormData.tax.cash,
            card: itemFormData.tax.card,
          })
        );
      }

      // Add discount if provided
      if (itemFormData.discount) {
        formData.append("discount", parseFloat(itemFormData.discount));
      }

      const response = await createItem(formData);

      if (response.data?.success) {
        setItemCreationSuccess("Item created successfully!");

        // Add the new item to created items
        const newItem = response.data.data;

        // Call onSuccess for wizard flow (pass the new item)
        if (onSuccess) {
          onSuccess(3, newItem);
        }

        // If we have selectedAdmin context and callback, refresh the items
        if (selectedAdmin && onItemCreated) {
          onItemCreated(selectedAdmin._id);
        }

        // Clear form for next item creation but keep modal open
        setItemFormData((prev) => ({
          ...prev,
          name: "",
          price: "",
          categoryId: "",
          options: [], // Reset options as well
          tax: {
            cash: "",
            card: "",
          },
          discount: "",
        }));

        // Clear image states
        setSelectedImage(null);
        setImagePreview("");
        const fileInput = document.getElementById("item-image-input");
        if (fileInput) {
          fileInput.value = "";
        }

        // Reset option form states
        setShowAddOption(false);
        setOptionFormData({
          name: "",
          price: "",
        });
        setOptionError("");

        // Clear success message after 3 seconds
        setTimeout(() => {
          setItemCreationSuccess("");
        }, 3000);
      } else {
        setItemCreationError("Failed to create item. Please try again.");
      }
    } catch (error) {
      console.error("Error creating item:", error);

      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        setItemCreationError(message || "Failed to create item");

        if (error.response.status === 400) {
          console.warn("Validation error:", { message, serverError });
        } else if (error.response.status === 401) {
          console.warn("Unauthorized - invalid or missing token");
          setItemCreationError("Authentication required. Please log in again.");
        } else if (error.response.status === 403) {
          console.warn("Access denied - insufficient permissions");
          setItemCreationError(
            "Access denied. You do not have permission to create items."
          );
        } else if (error.response.status === 404) {
          console.warn("Category not found");
          setItemCreationError(
            "Selected category not found. Please select a valid category."
          );
        } else if (error.response.status === 500) {
          console.error("Server error during item creation");
          setItemCreationError("Server error. Please try again later.");
        }
      } else if (error.request) {
        console.error("Network error - unable to reach server:", error.request);
        setItemCreationError(
          "Network error. Please check your connection and try again."
        );
      } else {
        console.error("Unexpected error during item creation:", error.message);
        setItemCreationError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleImportItems = async () => {
    if (!importFromAdminId || !itemFormData.adminId) {
      setImportError("Please select both source admin and target admin");
      return;
    }

    if (importFromAdminId === itemFormData.adminId) {
      setImportError("Source and target admin cannot be the same");
      return;
    }

    setIsImporting(true);
    setImportError("");
    setImportSuccess("");

    try {
      const response = await importItems({
        sourceAdminId: importFromAdminId,
        targetAdminId: itemFormData.adminId,
      });

      const items = response.data.data || [];
      setImportedItems(items);

      // Initialize category assignments
      const assignments = {};
      items.forEach((item) => {
        assignments[item._id] = "";
      });
      setCategoryAssignments(assignments);

      // Refresh categories for the target admin to include any newly created/imported categories
      if (itemFormData.adminId) {
        fetchCategoriesForAdmin(itemFormData.adminId);
        // Also call the parent callback to refresh categories
        if (onCategoryCreated) {
          onCategoryCreated(itemFormData.adminId);
        }
      }

      setImportSuccess(
        `Successfully imported ${items.length} items! Now assign categories to each item.`
      );
      setShowCategoryAssignment(true);
      setImportFromAdminId("");
      setShowImportSection(false);
    } catch (error) {
      console.error("Failed to import items:", error);

      if (error.response?.data) {
        setImportError(error.response.data.message || "Failed to import items");
      } else {
        setImportError("An error occurred while importing items");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleAssignCategories = async () => {
    // Validate that all items have categories assigned
    const assignments = Object.entries(categoryAssignments)
      .map(([itemId, categoryId]) => ({ itemId, categoryId }))
      .filter((assignment) => assignment.categoryId);

    if (assignments.length !== importedItems.length) {
      setImportError("Please assign categories to all imported items");
      return;
    }

    setIsAssigningCategories(true);
    setImportError("");

    try {
      const response = await assignCategoriesToImportedItems({ assignments });

      // Create detailed success message
      const itemCount = importedItems.length;
      const categoryCount = new Set(Object.values(categoryAssignments)).size;
      const successMessage = `🎉 Import completed successfully! ${itemCount} items have been added to ${categoryCount} categories and are now available in your menu.`;

      setImportSuccess(successMessage);

      // Call parent notification if available
      if (onImportSuccess) {
        onImportSuccess(successMessage);
      }

      // Update step completion tracking for Setup Wizard
      if (onSuccess && isSetupWizard) {
        // For setup wizard, call onSuccess with imported data to update tracking
        onSuccess(3, importedItems);
      }

      setShowCategoryAssignment(false);

      // Store imported items before clearing for step tracking
      const completedImportedItems = [...importedItems];
      setImportedItems([]);
      setCategoryAssignments({});

      // Refresh both items and categories if callbacks are available
      if (selectedAdmin) {
        if (onItemCreated) {
          onItemCreated(selectedAdmin._id);
        }
        if (onCategoryCreated) {
          onCategoryCreated(selectedAdmin._id);
        }
        // Also refresh local categories to ensure dropdown is updated
        fetchCategoriesForAdmin(selectedAdmin._id);
      }

      // Clear success message after 5 seconds (longer for detailed message)
      setTimeout(() => {
        setImportSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Failed to assign categories:", error);

      if (error.response?.data) {
        setImportError(
          error.response.data.message || "Failed to assign categories"
        );
      } else {
        setImportError("An error occurred while assigning categories");
      }
    } finally {
      setIsAssigningCategories(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Create Item</h2>
        <p className="text-[#a0a0a0] text-sm mb-6">
          Add menu items with pictures and assign to categories. You can create
          multiple items.
        </p>

        {itemCreationError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-100 text-sm">{itemCreationError}</p>
          </div>
        )}

        {itemCreationSuccess && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-100 text-sm">{itemCreationSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={itemFormData.name}
              onChange={handleItemFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter item name"
              disabled={isCreatingItem}
            />
          </div>

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={itemFormData.price}
              onChange={handleItemFormChange}
              step="0.01"
              min="0"
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter price"
              disabled={isCreatingItem}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                Tax Rates *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a0a0a0] text-xs font-medium mb-1">
                    Cash Tax (%)
                  </label>
                  <input
                    type="text"
                    name="taxCash"
                    value={itemFormData.tax.cash}
                    onChange={handleItemFormChange}
                    className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
                    placeholder="0.00"
                    disabled={isCreatingItem}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#a0a0a0] text-xs font-medium mb-1">
                    Card Tax (%)
                  </label>
                  <input
                    type="text"
                    name="taxCard"
                    value={itemFormData.tax.card}
                    onChange={handleItemFormChange}
                    className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
                    placeholder="0.00"
                    disabled={isCreatingItem}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                Discount Amount
              </label>
              <input
                type="number"
                name="discount"
                value={itemFormData.discount}
                onChange={handleItemFormChange}
                step="0.01"
                min="0"
                className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
                placeholder="0.00"
                disabled={isCreatingItem}
              />
            </div>
          </div>

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Admin *
            </label>
            <select
              name="adminId"
              value={itemFormData.adminId}
              onChange={handleItemFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              disabled={isCreatingItem || isLoadingAdmins}
            >
              <option value="">
                {isLoadingAdmins ? "Loading admins..." : "Select admin..."}
              </option>
              {/* In Setup Wizard, only show the created user */}
              {/* In Settings, only show the selected admin */}
              {isSetupWizard ? (
                createdUser && (
                  <option value={createdUser.id}>
                    {createdUser.name} ({createdUser.email})
                  </option>
                )
              ) : isSettings && selectedAdmin ? (
                <option value={selectedAdmin._id}>
                  {selectedAdmin.name} ({selectedAdmin.email})
                </option>
              ) : (
                <>
                  {/* Show created user first if exists and not in Setup Wizard */}
                  {createdUser && (
                    <option value={createdUser.id}>
                      {createdUser.name} ({createdUser.email})
                    </option>
                  )}
                  {/* Show all other admins */}
                  {allAdmins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={itemFormData.categoryId}
              onChange={handleItemFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              disabled={
                isCreatingItem ||
                currentLoadingCategories ||
                !itemFormData.adminId
              }
            >
              <option value="">
                {!itemFormData.adminId
                  ? "Select admin first..."
                  : currentLoadingCategories
                  ? "Loading categories..."
                  : "Select category..."}
              </option>
              {currentCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {!itemFormData.adminId && (
              <p className="text-[#a0a0a0] text-xs mt-1">
                Please select an admin first to load categories
              </p>
            )}
          </div>

          {/* Import Items Section */}
          {itemFormData.adminId && availableAdminsForImport.length > 0 && (
            <div className="border-t border-[#404040] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#f5f5f5] text-sm font-medium">
                  Import Items
                </h3>
                <button
                  type="button"
                  onClick={() => setShowImportSection(!showImportSection)}
                  className="text-[#60a5fa] text-sm hover:text-[#3b82f6] transition-colors"
                  disabled={isCreatingItem || isImporting}
                >
                  {showImportSection
                    ? "Hide Import"
                    : "Import from another admin"}
                </button>
              </div>

              {showImportSection && (
                <div className="space-y-3 p-3 bg-[#262626] rounded-lg border border-[#404040]">
                  <p className="text-[#a0a0a0] text-xs">
                    Import items from another admin. You'll need to assign
                    categories to imported items.
                  </p>

                  {/* Import Error/Success Messages */}
                  {importError && (
                    <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-300 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✗</span>
                        </div>
                        <span className="font-medium">Import Failed</span>
                      </div>
                      <p className="text-xs">{importError}</p>
                    </div>
                  )}

                  {importSuccess && (
                    <div className="p-3 bg-green-900/20 border border-green-500 rounded text-green-300 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="font-medium">Import Successful!</span>
                      </div>
                      <p className="text-xs">{importSuccess}</p>
                      {importedItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-green-500/30">
                          <p className="text-xs font-medium mb-1">
                            Imported {importedItems.length} items:
                          </p>
                          <div className="grid grid-cols-2 gap-1 max-h-20 overflow-y-auto">
                            {importedItems.slice(0, 6).map((item, index) => (
                              <div
                                key={item._id}
                                className="text-xs bg-green-800/30 px-2 py-1 rounded"
                              >
                                {item.name}
                              </div>
                            ))}
                            {importedItems.length > 6 && (
                              <div className="text-xs bg-green-800/30 px-2 py-1 rounded text-center">
                                +{importedItems.length - 6} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[#f5f5f5] text-xs font-medium mb-2">
                      Import items from:
                    </label>
                    <select
                      value={importFromAdminId}
                      onChange={(e) => setImportFromAdminId(e.target.value)}
                      disabled={isImporting}
                      className="w-full p-2 bg-[#1a1a1a] text-[#f5f5f5] rounded border border-[#404040] focus:border-[#60a5fa] focus:outline-none text-sm disabled:opacity-50"
                    >
                      <option value="">Select admin to import from...</option>
                      {availableAdminsForImport.map((admin) => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportItems}
                    disabled={!importFromAdminId || isImporting}
                    className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                      !importFromAdminId || isImporting
                        ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                        : "bg-[#16a34a] hover:bg-[#15803d] text-white"
                    }`}
                  >
                    {isImporting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Importing...
                      </div>
                    ) : (
                      "Import Items"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category Assignment Section for Imported Items */}
          {showCategoryAssignment && importedItems.length > 0 && (
            <div className="border-t border-[#404040] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#f5f5f5] text-sm font-medium flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">
                      {importedItems.length}
                    </span>
                  </div>
                  Imported Items - Assign Categories
                </h3>
                <div className="text-xs text-[#a0a0a0] bg-[#262626] px-2 py-1 rounded">
                  Step 2 of 2
                </div>
              </div>
              <p className="text-[#a0a0a0] text-xs mb-3">
                Assign categories to each imported item to complete the import
                process.
              </p>
              <div className="space-y-3 p-3 bg-[#262626] rounded-lg border border-[#404040] max-h-60 overflow-y-auto">
                {importedItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded border border-[#2a2a2a]"
                  >
                    <div className="w-8 h-8 bg-[#262626] rounded flex items-center justify-center text-xs text-[#a0a0a0]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#f5f5f5] text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-[#a0a0a0] text-xs">Rs {item.price}</p>
                      {item.description && (
                        <p className="text-[#606060] text-xs mt-1 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <select
                        value={categoryAssignments[item._id] || ""}
                        onChange={(e) =>
                          setCategoryAssignments((prev) => ({
                            ...prev,
                            [item._id]: e.target.value,
                          }))
                        }
                        disabled={isAssigningCategories}
                        className={`w-full p-2 bg-[#262626] text-[#f5f5f5] rounded border ${
                          categoryAssignments[item._id]
                            ? "border-green-500 bg-green-900/20"
                            : "border-[#404040]"
                        } focus:border-[#60a5fa] focus:outline-none text-xs`}
                      >
                        <option value="">Select category...</option>
                        {currentCategories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categoryAssignments[item._id] && (
                        <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                          <span>✓</span>
                          <span>Category assigned</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-[#a0a0a0]">
                  {Object.values(categoryAssignments).filter(Boolean).length} of{" "}
                  {importedItems.length} items have categories assigned
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      Object.values(categoryAssignments).filter(Boolean)
                        .length === importedItems.length
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <span className="text-xs text-[#a0a0a0]">
                    {Object.values(categoryAssignments).filter(Boolean)
                      .length === importedItems.length
                      ? "Ready to finalize"
                      : "Assign remaining categories"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAssignCategories}
                disabled={
                  isAssigningCategories ||
                  Object.values(categoryAssignments).some((cat) => !cat)
                }
                className={`w-full py-3 px-3 rounded text-sm font-medium transition-colors mt-3 ${
                  isAssigningCategories ||
                  Object.values(categoryAssignments).some((cat) => !cat)
                    ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                    : "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                }`}
              >
                {isAssigningCategories ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finalizing Import...
                  </div>
                ) : (
                  `Finalize Import (${
                    Object.values(categoryAssignments).filter(Boolean).length
                  }/${importedItems.length})`
                )}
              </button>
            </div>
          )}

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Item Image *
            </label>

            {/* Image upload input */}
            <input
              id="item-image-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
              disabled={isCreatingItem}
            />

            {/* Custom upload button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("item-image-input").click()
                }
                disabled={isCreatingItem}
                className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isCreatingItem
                    ? "border-[#404040] bg-[#262626] text-[#606060] cursor-not-allowed"
                    : "border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#60a5fa] hover:bg-[#2a2a2a]"
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 mb-2 text-[#a0a0a0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedImage ? "Change Image" : "Upload Item Image"}
                  </span>
                  <span className="text-xs text-[#a0a0a0] mt-1">
                    Supported: JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </div>
              </button>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#404040]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isCreatingItem}
                    className={`absolute top-2 right-2 p-1 rounded-full ${
                      isCreatingItem
                        ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Selected file info */}
              {selectedImage && (
                <div className="text-xs text-[#a0a0a0]">
                  <p>Selected: {selectedImage.name}</p>
                  <p>
                    Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Options Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#f5f5f5] text-sm font-medium">
                Item Options
              </label>
              <button
                type="button"
                onClick={handleToggleAddOption}
                disabled={isCreatingItem}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isCreatingItem
                    ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                    : "bg-[#10b981] hover:bg-[#059669] text-white"
                }`}
              >
                + Add Option
              </button>
            </div>

            {/* Existing Options Display */}
            {itemFormData.options.length > 0 && (
              <div className="mb-3 p-3 bg-[#262626] rounded-lg border border-[#404040]">
                <h4 className="text-[#f5f5f5] text-sm font-medium mb-2">
                  Added Options ({itemFormData.options.length})
                </h4>
                <div className="space-y-2">
                  {itemFormData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded border border-[#404040]"
                    >
                      <div className="flex-1">
                        <span className="text-[#f5f5f5] font-medium">
                          {option.name}
                        </span>
                        <span className="text-[#10b981] ml-2">
                          Rs{option.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        disabled={isCreatingItem}
                        className={`px-2 py-1 rounded text-xs ${
                          isCreatingItem
                            ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                            : "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Option Form */}
            {showAddOption && (
              <div className="p-4 bg-[#262626] rounded-lg border border-[#404040] mb-3">
                <h4 className="text-[#f5f5f5] text-sm font-medium mb-3">
                  Add New Option
                </h4>

                {optionError && (
                  <div className="mb-3 p-2 bg-red-900/20 border border-red-500 rounded">
                    <p className="text-red-300 text-sm">{optionError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[#f5f5f5] text-xs font-medium mb-1">
                      Option Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={optionFormData.name}
                      onChange={handleOptionFormChange}
                      className="w-full p-2 bg-[#1a1a1a] text-[#f5f5f5] rounded border border-[#404040] focus:border-[#60a5fa] focus:outline-none text-sm"
                      placeholder="e.g., Extra Cheese"
                      disabled={isCreatingItem}
                    />
                  </div>
                  <div>
                    <label className="block text-[#f5f5f5] text-xs font-medium mb-1">
                      Option Price *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={optionFormData.price}
                      onChange={handleOptionFormChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 bg-[#1a1a1a] text-[#f5f5f5] rounded border border-[#404040] focus:border-[#60a5fa] focus:outline-none text-sm"
                      placeholder="0.00"
                      disabled={isCreatingItem}
                    />
                  </div>
                </div>

                {/* Add the checkbox for option status */}
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="option-active"
                    name="option"
                    checked={optionFormData.option}
                    onChange={handleOptionFormChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="option-active"
                    className="ms-2 text-sm font-medium text-[#f5f5f5]"
                  >
                    make this option
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={
                      isCreatingItem ||
                      !optionFormData.name ||
                      optionFormData.price === ""
                    }
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      isCreatingItem ||
                      !optionFormData.name ||
                      optionFormData.price === ""
                        ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                        : "bg-[#10b981] hover:bg-[#059669] text-white"
                    }`}
                  >
                    Add Option
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleAddOption}
                    disabled={isCreatingItem}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      isCreatingItem
                        ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                        : "bg-[#404040] hover:bg-[#505050] text-[#f5f5f5]"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <p className="text-[#a0a0a0] text-xs">
              Add optional extras or variations for this item (e.g., Extra
              Cheese, Large Size)
            </p>
          </div>

          {/* Show created items summary */}
          {onSuccess && (
            <div className="mt-4 p-4 bg-[#262626] rounded-lg">
              <h3 className="text-[#f5f5f5] text-sm font-medium mb-3">
                Items created in this session: Keep adding more items or click
                "Done" when finished.
              </h3>
              <p className="text-[#10b981] text-xs">
                ✓ Each created item will be added to your menu automatically
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isCreatingItem}
            className={`px-4 py-2 rounded-lg ${
              isCreatingItem
                ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                : "bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]"
            }`}
          >
            Done
          </button>
          <button
            onClick={handleCreateItem}
            disabled={
              isCreatingItem ||
              !itemFormData.name ||
              !itemFormData.price ||
              !itemFormData.categoryId ||
              !itemFormData.adminId ||
              !itemFormData.tax.cash ||
              !itemFormData.tax.card
            }
            className={`px-6 py-2 rounded-lg font-medium ${
              isCreatingItem ||
              !itemFormData.name ||
              !itemFormData.price ||
              !itemFormData.categoryId ||
              !itemFormData.adminId ||
              !itemFormData.tax.cash ||
              !itemFormData.tax.card
                ? "bg-[#404040] text-[#606060] cursor-not-allowed"
                : "bg-[#60a5fa] text-white hover:bg-[#3b82f6]"
            }`}
          >
            {isCreatingItem ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateItemModal;
