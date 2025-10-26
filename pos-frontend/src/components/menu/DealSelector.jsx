import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaTag } from "react-icons/fa";
import { getMyDeals } from "../../https/index";
import { addDealToCart } from "../../redux/slices/dealSlice";
import { useDispatch } from "react-redux";
import DealOptionsModal from "./DealOptionsModal";

const DealSelector = () => {
  const [availableDeals, setAvailableDeals] = useState([]);
  const [dealQuantities, setDealQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // New state to manage the Deal Customization Modal
  const [showDealCustomizationModal, setShowDealCustomizationModal] =
    useState(false);
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

  const dispatch = useDispatch();

  useEffect(() => {
    fetchDeals();

    // Initialize quantities from selected deals
    const quantities = {};
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getMyDeals();
      if (response.data?.success) {
        setAvailableDeals(response.data.data || []);
      } else {
        setAvailableDeals([]);
        setError("No deals available");
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAvailableDeals([]);
      setError("Failed to load deals");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDealQuantity = (dealId, quantity) => {
    if (quantity <= 0) {
      const newQuantities = { ...dealQuantities };
      delete newQuantities[dealId];
      setDealQuantities(newQuantities);
    } else {
      setDealQuantities((prev) => ({
        ...prev,
        [dealId]: quantity,
      }));
    }
  };
  const handleAddDeal = (deal) => {
    // Create a new deal object to dispatch
    const dealToAdd = {
      ...deal, // Spread the original deal data
      dealId: deal._id, // Ensure a consistent dealId
      quantity: 1, // Start with a quantity of 1
    };
    dispatch(addDealToCart(dealToAdd));
  };
  
  const getDealTotal = (deal, quantity) => {
    return deal.dealPrice * quantity;
  };

  const getSelectedDealsData = () => {
    return Object.entries(dealQuantities)
      .map(([dealId, quantity]) => {
        const deal = availableDeals.find((d) => d._id === dealId);
        return {
          dealId,
          quantity,
          deal,
          total: getDealTotal(deal, quantity),
        };
      })
      .filter((item) => item.deal);
  };

  const isExpired = (deal) => {
    return deal.validUntil && new Date() > new Date(deal.validUntil);
  };

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="px-4 sm:px-6 md:px-10 py-2">
          <h2 className="text-[#f5f5f5] text-lg font-semibold mb-2">Deals</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 sm:px-6 md:px-10 mb-4 p-3 bg-[#ef4444]/20 border border-[#ef4444]/50 rounded-lg">
            <p className="text-[#ef4444] text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="px-4 sm:px-6 md:px-10 flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6b100]"></div>
          </div>
        )}

        {/* Deals Grid */}
        {availableDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 px-4 sm:px-6 md:px-10 py-4 w-full">
            {availableDeals.map((deal) => {
              const quantity = dealQuantities[deal._id] || 0;
              const expired = isExpired(deal);

              return (
                <div
                  onClick={() => handleCustomizeDeal(deal)}
                  key={deal._id}
                  className={`bg-[#1f1f1f] rounded-lg p-3 sm:p-4 border ${
                    expired
                      ? "border-[#404040] opacity-60"
                      : quantity > 0
                      ? "border-[#f6b100]"
                      : "border-[#3a3a3a] hover:border-[#606060]"
                  } transition-colors min-h-[180px] sm:min-h-[200px] md:min-h-[220px]`}
                >
                  <div className="flex flex-col h-full">
                    {/* Deal Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[#f5f5f5] font-semibold text-sm md:text-base mb-1 ">
                        {deal.name}
                      </h3>
                      {expired && (
                        <span className="text-xs text-[#ef4444]">Expired</span>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#f59e0b] font-bold text-sm md:text-base">
                        Rs{deal.dealPrice}
                      </span>
                      {deal.savings > 0 && (
                        <span className="text-xs text-[#10b981] line-through">
                          Rs{deal.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {deal.description && (
                      <p className="text-[#ababab] text-xs mb-3 flex-1 line-clamp-2">
                        {deal.description}
                      </p>
                    )}

                    {/* Included Items */}
                    <div className="mb-3">
                      
                      <div className="flex flex-wrap gap-1">
                        {deal.items?.slice(0, 3).map((item, index) => (
                          <span
                            key={index}
                            className="text-xs text-[#ababab] bg-[#2a2a2a] px-2 py-1 rounded"
                          >
                            {item.itemId?.name || "Item"} ×{item.quantity}
                          </span>
                        ))}
                        {deal.items?.length > 3 && (
                          <span className="text-xs text-[#ababab] bg-[#2a2a2a] px-2 py-1 rounded">
                            +{deal.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    {!expired && (
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {quantity > 0 && (
                              <button
                                onClick={() =>
                                  updateDealQuantity(
                                    deal._id,
                                    Math.max(0, quantity - 1)
                                  )
                                }
                                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#dc2626] text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold hover:bg-[#b91c1c] transition-colors"
                              >
                                <FaMinus />
                              </button>
                            )}

                            {quantity > 0 && (
                              <span className="text-[#f5f5f5] font-semibold text-sm md:text-base min-w-[20px] text-center">
                                {quantity}
                              </span>
                            )}
                          </div>

                          {quantity > 0 && (
                            <span className="text-[#f59e0b] font-bold text-sm md:text-base">
                              Rs{getDealTotal(deal, quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="px-4 sm:px-6 md:px-10 text-center py-8">
              <FaTag className="text-[#ababab] text-4xl mx-auto mb-4" />
              <p className="text-[#ababab] mb-4">No deals available</p>
            </div>
          )
        )}

        {/* Apply Button (fixed at bottom if needed) */}
        {Object.keys(dealQuantities).length > 0 && (
          <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-[#2a2a2a] p-4 z-10">
            <div className="flex justify-end">
              <button
                onClick={() => onDealsSelected(getSelectedDealsData())}
                className="px-6 py-3 bg-gradient-to-r from-[#f6b100] to-[#e6a000] text-[#1f1f1f] rounded-lg font-bold hover:from-[#e6a000] hover:to-[#d69100] transition-all"
              >
                Apply Selected Deals
              </button>
            </div>
          </div>
        )}
      </div>
      <DealOptionsModal
        deal={dealBeingCustomized}
        isOpen={showDealCustomizationModal}
        onClose={handleCloseDealCustomizationModal}
      />
    </>
  );
};

export default DealSelector;
