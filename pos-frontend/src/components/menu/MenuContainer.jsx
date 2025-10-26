import React, { useState, useEffect } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import { getCategories, getItemsByCategory, getMenus } from "../../https";
import ItemOptionsModal from "./ItemOptionsModal";
import DealSelector from "./DealSelector";
import DealOptionsModal from "./DealOptionsModal";

const MenuContainer = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [menusData, setMenusData] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [menusLoading, setMenusLoading] = useState(false);
  const [itemCount, setItemCount] = useState({});
  const [viewMode, setViewMode] = useState("categories"); // 'categories', 'categoryItems', 'menus', 'menuItems'
  const [categoryItemsData, setCategoryItemsData] = useState({}); // Store items for each category
  const [categoryItemsLoading, setCategoryItemsLoading] = useState({}); // Track loading for each category
  const [menuItemsData, setMenuItemsData] = useState({}); // Store items for each menu
  const [menuItemsLoading, setMenuItemsLoading] = useState({}); // Track loading for each menu
  const dispatch = useDispatch();
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [showDealSelector, setShowDealSelector] = useState(false);

 const [showDealCustomizationModal, setShowDealCustomizationModal] = useState(false);
  const [dealBeingCustomized, setDealBeingCustomized] = useState(null);

  // New handler to open the customization modal
  const handleCustomizeDeal = (deal) => {
    setDealBeingCustomized(deal);
    setShowDealCustomizationModal(true);
  };
  
  // New handler to close the customization modal
  const handleCloseDealCustomizationModal = () => {
    setShowDealCustomizationModal(false);
    setDealBeingCustomized(null);
  };

  const handleSelectDeals = () => {
    setShowDealSelector(true);
  };

  const handleDealsSelected = (deals) => {
    setSelectedDeals(deals);
  };

  const removeDeal = (dealId) => {
    setSelectedDeals((prev) =>
      prev.filter((deal) => (deal.dealId || deal._id) !== dealId)
    );
  };
  // Options modal state
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState(null);
  const [selectedItemQuantity, setSelectedItemQuantity] = useState(1);
  const handleScroll = (Id) => {
    const element = document.getElementById(Id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate consistent, user-friendly colors for categories and menus
  const getConsistentColor = (identifier) => {
    const colorPalette = [
      { bg: "#4F46E5", text: "#E0E7FF" }, // Indigo
      { bg: "#059669", text: "#D1FAE5" }, // Emerald
      { bg: "#DC2626", text: "#FEE2E2" }, // Red
      { bg: "#7C3AED", text: "#EDE9FE" }, // Violet
      { bg: "#EA580C", text: "#FED7AA" }, // Orange
      { bg: "#0891B2", text: "#CFFAFE" }, // Cyan
      { bg: "#BE185D", text: "#FCE7F3" }, // Pink
      { bg: "#65A30D", text: "#ECFCCB" }, // Lime
      { bg: "#7C2D12", text: "#FEF3C7" }, // Amber
      { bg: "#1E40AF", text: "#DBEAFE" }, // Blue
    ];

    // Create a simple hash from the identifier
    let hash = 0;
    const str = identifier.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Use absolute value and modulo to get consistent index
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
  };

  // Fetch categories and menus on component mount
  useEffect(() => {
    fetchCategories();
    fetchMenus();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getCategories();
      if (response.data.success) {
        const categoriesApiData = response.data.data;

        // Assign consistent colors to categories
        const categoriesWithColors = await Promise.all(
          categoriesApiData.map(async (category) => {
            console.log("category id", category._id);
            const colors = getConsistentColor(category._id || category.name);
            const itemsResponse = await getItemsByCategory(category._id);
            console.log("items response", itemsResponse);
            const itemCount = itemsResponse.data.success
              ? (itemsResponse.data.data || []).length
              : 0;
            console.log("item count", itemCount);
            return {
              ...category,
              bgColor: category.bgColor || colors.bg,
              textColor: category.textColor || colors.text,
              itemCount: itemCount,
            };

            
          })
        );
        console.log("color with category" ,categoriesWithColors)

        setCategoriesData(categoriesWithColors);

        // Load items for all categories
        categoriesWithColors.forEach((category) => {
          loadCategoryItems(category);
        });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesData([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

 

  const fetchMenus = async () => {
    try {
      setMenusLoading(true);
      const response = await getMenus();
      if (response.data.success) {
        const menusApiData = response.data.data;

        //Assign consistent colors to menus that don't have bgColor
        const menusWithColors = menusApiData.map((menu) => {
          const colors = getConsistentColor(menu._id || menu.name);
          return {
            ...menu,
            bgColor: menu.bgColor || colors.bg,
            textColor: menu.textColor || colors.text,
            itemCount: menu.itemsID ? menu.itemsID.length : 0,
          };
        });

        setMenusData(menusWithColors);

        //Load items for all menus
        menusWithColors.forEach((menu) => {
          loadMenuItems(menu);
        });
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      //Fallback to constants if API fails
      const menusWithColors = menus.map((menu) => {
        const colors = getConsistentColor(menu.id || menu.name);
        return {
          ...menu,
          bgColor: menu.bgColor || colors.bg,
          textColor: menu.textColor || colors.text,
          itemCount: menu.items ? menu.items.length : 0,
        };
      });
      setMenusData(menusWithColors);

      //Load items for all menus
      menusWithColors.forEach((menu) => {
        loadMenuItems(menu);
      });
    } finally {
      setMenusLoading(false);
    }
  };

  const loadMenuItems = async (menu) => {
    const menuId = menu._id || menu.id;

    try {
      setMenuItemsLoading((prev) => ({ ...prev, [menuId]: true }));

      let itemsToShow = [];
      if (menu.itemsID && menu.itemsID.length > 0) {
        itemsToShow = menu.itemsID;
      } else if (menu.items) {
        itemsToShow = menu.items;
      }

      setMenuItemsData((prev) => ({
        ...prev,
        [menuId]: itemsToShow,
      }));
    } catch (error) {
      console.error("Error loading menu items:", error);
      setMenuItemsData((prev) => ({
        ...prev,
        [menuId]: [],
      }));
    } finally {
      setMenuItemsLoading((prev) => ({ ...prev, [menuId]: false }));
    }
  };

  const loadCategoryItems = async (category) => {
    const categoryId = category._id;

    try {
      setCategoryItemsLoading((prev) => ({ ...prev, [categoryId]: true }));

      const response = await getItemsByCategory(categoryId);
      if (response.data.success) {
        const itemsData = response.data.data || [];

        setCategoryItemsData((prev) => ({
          ...prev,
          [categoryId]: itemsData,
        }));
      }
    } catch (error) {
      console.error(
        `Error loading items for category ${category.name}:`,
        error
      );
      setCategoryItemsData((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    } finally {
      setCategoryItemsLoading((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setItems(categoryItemsData[category._id] || []);
    setViewMode("categoryItems");
  };

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    setViewMode("menuItems");
  };

  const handleBackToMain = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setSelectedMenu(null);
    setItems([]);
    setItemCount({});
  };

  const increment = (id) => {
    const currentCount = itemCount[id] || 0;
    if (currentCount >= 4) return;
    setItemCount((prev) => ({
      ...prev,
      [id]: currentCount + 1,
    }));
  };

  const decrement = (id) => {
    const currentCount = itemCount[id] || 0;
    if (currentCount <= 0) return;
    setItemCount((prev) => ({
      ...prev,
      [id]: currentCount - 1,
    }));
  };

  const handleAddToCart = async (item, quantity, itemKey) => {
    console.log("Adding item to cart:", item, quantity, itemKey);
    console.log("Item count before adding:", viewMode);
    console.log("mera 12", menusData)
    const itemId = item._id || item.id;
    const currentCount = 1;
    // quantity || itemCount[itemKey] || itemCount[itemId] || 0;

    if (currentCount === 0) return;

    // Check if item has options - if so, open options modal
    if (item.options && item.options.length > 0) {
      setSelectedItemForOptions(item);
      setSelectedItemQuantity(currentCount);
      setShowOptionsModal(true);
      return;
    }

    // If no options, proceed with normal add to cart
    addItemToCart(item, currentCount, itemKey);
  };

  const addItemToCart = async (item, quantity, itemKey) => {
    const itemId = item._id || item.id;
    const { name, price } = item;

    // Determine menu information for the item
    let menuId = null;
    let menuName = null;

    if (viewMode === "categories") {

      const menuContainingItem = menusData.find(
        (menu) =>
          menu.itemsID &&
          menu.itemsID.some((menuItem) => {
            const menuItemId = menuItem._id || menuItem.id;
            return menuItemId === itemId;
          })
      );

      if (menuContainingItem) {
        menuId = menuContainingItem._id;
        menuName = menuContainingItem.name;
      } else {
        // Fallback - use a default menu name but keep the structure
        menuName = "General Items";
      }
    } else {
      // Fallback case
      menuName = "General Items";
    }

    // Calculate final price including options
    let finalPrice = price * quantity;
    let itemName = name;
    let selectedOptions = [];

    // If item has selected options (from modal), include them
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      selectedOptions = item.selectedOptions;
      const optionsPrice = selectedOptions.reduce(
        (total, option) => total + option.price * quantity,
        0
      );
      finalPrice = price * quantity + optionsPrice;

      // Add options to item name for display
      const optionNames = selectedOptions.map((opt) => opt.name).join(", ");
      itemName = `${name} (${optionNames})`;
    }

    const newObj = {
      id: new Date(),
      itemId: itemId,
      name: itemName,
      originalName: name,
      pricePerQuantity: item.totalPrice ? item.totalPrice / quantity : price,
      quantity: quantity,
      price: item.totalPrice || finalPrice,
      menuId: menuId,
      categoryId: selectedCategory?._id || null,
      menuName: menuName,
      categoryName: selectedCategory?.name || null,
      selectedOptions: selectedOptions,
      basePrice: price,
    };

    dispatch(addItems(newObj));

    // Reset the count for this specific item after adding to cart
    if (itemKey) {
      setItemCount((prev) => ({
        ...prev,
        [itemKey]: 0,
      }));
    } else {
      setItemCount((prev) => ({
        ...prev,
        [itemId]: 0,
      }));
    }
  };

  // Handle add to cart from options modal
  const handleAddToCartFromModal = (itemWithOptions, quantity) => {
    const itemKey = itemWithOptions._id || itemWithOptions.id;
    addItemToCart(itemWithOptions, quantity, itemKey);

    // Reset the count for this specific item after adding to cart
    setItemCount((prev) => ({
      ...prev,
      [itemKey]: 0,
    }));
  };

  // Close options modal
  const handleCloseOptionsModal = () => {
    setShowOptionsModal(false);
    setSelectedItemForOptions(null);
    setSelectedItemQuantity(1);
  };

  return (
    <>
      {(loading || categoriesLoading || menusLoading) && (
        <div className="flex justify-center items-center p-8">
          <div className="text-[#f5f5f5] text-lg">Loading...</div>
        </div>
      )}

      {/* Categories Section */}
      <div className="px-4 sm:px-6 md:px-10 py-2">
        <h2
          className="text-[#f5f5f5] text-lg font-semibold mb-2"
          id="topCategory"
        >
          Categories
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 sm:px-6 md:px-10 py-4 w-full">
        {categoriesData.map((category) => {
          return (
            <div
              key={category._id}
              className="flex flex-col items-start justify-between p-3 md:p-4 rounded-lg  cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: category.bgColor || "#2a2a2a" }}
              onClick={() => handleScroll(category._id)}
            >
              <div className="flex items-center justify-between w-full">
                <h1
                  className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold  pr-2"
                  style={{ color: category.textColor || "#f5f5f5" }}
                >
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">
                    {category.name.length > 8
                      ? category.name.substring(0, 8) + "..."
                      : category.name}
                  </span>
                </h1>
              </div>
              <p
                className="text-xs sm:text-sm font-semibold opacity-80"
                style={{ color: category.textColor || "#ababab" }}
              >
                {category.itemCount || 0} Items
              </p>
            </div>
          );
        })}
        <div
          className="flex flex-col items-start justify-between p-3 md:p-4 rounded-lg h-[80px] sm:h-[90px] md:h-[100px] cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: "#c20303ff" }}
          onClick={() => handleScroll("dealsSection")}
        >
          <div className="flex items-center justify-between w-full">
            <h1
              className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold pr-2"
              style={{ color: "#f5f5f5" }}
            >
              <span className="hidden sm:inline">Deals</span>
            </h1>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 md:px-10 py-4 w-full space-y-8">
        {categoriesData.map((category) => {
          const categoryId = category._id;
          const categoryItems = categoryItemsData[categoryId] || [];
          const isLoadingItems = categoryItemsLoading[categoryId];

          return (
            <div key={categoryId} className="w-full" id={categoryId}>
              {/* Category Header */}
              <div
                className="flex flex-col items-start justify-between p-3 md:p-4 rounded-lg  cursor-pointer transition-transform hover:scale-105 mb-4"
                style={{ backgroundColor: category.bgColor || "#2a2a2a" }}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center justify-between w-full">
                  <h1
                    className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold  pr-2"
                    style={{ color: category.textColor || "#f5f5f5" }}
                  >
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">
                      {category.name.length > 8
                        ? category.name.substring(0, 8) + "..."
                        : category.name}
                    </span>
                  </h1>
                </div>
                <p
                  className="text-xs sm:text-sm font-semibold opacity-80"
                  style={{ color: category.textColor || "#ababab" }}
                >
                  {categoryItems.length} Items
                </p>
              </div>

              {/* Category Items Grid */}
              <div className="mb-8">
                {isLoadingItems ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-[#f5f5f5] text-sm">
                      Loading items...
                    </div>
                  </div>
                ) : categoryItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {categoryItems.map((item) => {
                      const itemKey = `${categoryId}-${item._id || item.id}`;
                      const currentCount = itemCount[itemKey] || 0;
                      console.log("name 2" , item.name)
                      return (
                        <div
                          key={itemKey}
                          className="bg-[#1f1f1f] rounded-lg p-3 sm:p-4 border border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors min-h-[180px] sm:min-h-[200px] md:min-h-[220px]"
                          onClick={() =>
                            handleAddToCart(
                              item,
                              itemCount[item._id || item.id],
                              item._id || item.id
                            )
                          }
                        >
                          <div className="flex flex-col h-full">
                            {/* Item Image */}
                            {item.image && (
                              <div className="w-full h-24 sm:h-28 md:h-32 mb-3 rounded-lg overflow-hidden bg-[#2a2a2a]">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                            )}

                            {/* Item Details */}
                            <div className="flex-1 flex flex-col">
                              <h3 className="text-[#f5f5f5] font-semibold text-sm md:text-base mb-1 ">
                                {item.name}
                              </h3>
                              <p className="text-[#ababab] text-xs md:text-sm mb-2 flex-1 line-clamp-2">
                              </p>

                              {/* Price and Controls */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#f59e0b] font-bold text-sm md:text-base">
                                    Rs{item.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#ababab] text-sm">
                      No items available in this category
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Menus Section */}
      <div className="px-4 sm:px-6 md:px-10 py-2 mt-6">
        <h2 className="text-[#f5f5f5] text-lg font-semibold mb-2">Menus</h2>
      </div>
      <div className="px-4 sm:px-6 md:px-10 py-4 w-full space-y-8">
        {menusData.map((menu) => {
          const menuId = menu._id || menu.id;
          const menuItems = menuItemsData[menuId] || [];
          const isLoadingItems = menuItemsLoading[menuId];

          return (
            <div key={menuId} className="w-full">
              {/* Menu Header */}
              <div className="mb-4">
                <div
                  className="flex flex-col items-start justify-between p-3 md:p-4 rounded-lg h-[80px] sm:h-[90px] md:h-[100px] transition-transform hover:scale-105"
                  style={{ backgroundColor: menu.bgColor || "#2a2a2a" }}
                >
                  <div className="flex items-center justify-between w-full">
                    <h1
                      className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold truncate pr-2"
                      style={{ color: menu.textColor || "#f5f5f5" }}
                    >
                      {menu.icon && (
                        <span className="mr-1 text-sm sm:text-base">
                          {menu.icon}
                        </span>
                      )}
                      <span className="hidden sm:inline">{menu.name}</span>
                      <span className="sm:hidden">
                        {menu.name.length > 8
                          ? menu.name.substring(0, 8) + "..."
                          : menu.name}
                      </span>
                    </h1>
                  </div>
                  <p
                    className="text-xs sm:text-sm font-semibold opacity-80"
                    style={{ color: menu.textColor || "#ababab" }}
                  >
                    {menu.itemCount || 0} Items
                  </p>
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="mb-8">
                {isLoadingItems ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-[#f5f5f5] text-sm">
                      Loading menu items...
                    </div>
                  </div>
                ) : menuItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {menuItems.map((item) => {
                      const itemKey = `${menuId}-${item._id || item.id}`;
                      const currentCount = itemCount[itemKey] || 0;
                      return (
                        <div
                          key={itemKey}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item, currentCount, itemKey);
                          }}
                          className="bg-[#1f1f1f] rounded-lg p-3 sm:p-4 border border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors min-h-[180px] sm:min-h-[200px] md:min-h-[220px]"
                        >
                          <div className="flex flex-col h-full">
                            {/* Item Image */}
                            {item.image && (
                              <div className="w-full h-24 sm:h-28 md:h-32 mb-3 rounded-lg overflow-hidden bg-[#2a2a2a]">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </div>
                            )}

                            {/* Item Details */}
                            <div className="flex-1 flex flex-col">
                              <h3 className="text-[#f5f5f5] font-semibold text-sm md:text-base mb-1 truncate">
                                {item.name}
                              </h3>
                              <p className="text-[#ababab] text-xs md:text-sm mb-2 flex-1 line-clamp-2">
                                {item.description || "Delicious menu item"}
                              </p>

                              {/* Price and Controls */}
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#f59e0b] font-bold text-sm md:text-base">
                                    Rs{item.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#ababab] text-sm">
                      No items available in this menu
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div id="dealsSection">
        <DealSelector
          onDealsSelected={handleDealsSelected}
          selectedDeals={selectedDeals}
        />
      </div>
      <button
        onClick={() => handleScroll("topCategory")}
        className="fixed bottom-20 left-6 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-full p-3 shadow-lg transition-colors duration-200 z-50"
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

       {/* New Deal Customization Modal */}
      
      {/* Options Modal */}
      <ItemOptionsModal
        item={selectedItemForOptions}
        isOpen={showOptionsModal}
        onClose={handleCloseOptionsModal}
        onAddToCart={handleAddToCartFromModal}
        quantity={selectedItemQuantity}
      />
    </>
  );
};

export default MenuContainer;
