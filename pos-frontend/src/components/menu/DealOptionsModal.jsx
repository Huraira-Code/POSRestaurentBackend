import React, { useEffect, useState } from "react";
import { FaTimes, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addDealToCart } from "../../redux/slices/dealSlice";

const DealOptionsModal = ({ deal, isOpen, onClose }) => {
  const dispatch = useDispatch();

  // State to track the user's selections for each customization
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  useEffect(() => {
    if (deal && deal.customizations) {
      const initialState = {};
      deal.customizations.forEach((cust) => {
        // Initialize with empty array for each customization
        initialState[cust.name] = [];
      });
      setSelectedCustomizations(initialState);
    } else {
      setSelectedCustomizations({});
    }
  }, [deal]);

  if (!isOpen || !deal) return null;

  const handleOptionAdd = (custName, option) => {
    setSelectedCustomizations((prevSelections) => {
      const currentSelections = [...(prevSelections[custName] || [])];
      const customizationConfig = deal.customizations.find(
        (c) => c.name === custName
      );
      const maxSelect = customizationConfig?.maxSelect;

      if (currentSelections.length < maxSelect) {
        currentSelections.push({
          ...option,
          selectedSubOption: null, // Initialize with no sub-option selected
        });
      }

      return {
        ...prevSelections,
        [custName]: currentSelections,
      };
    });
  };

  const handleOptionRemove = (custName, option) => {
    setSelectedCustomizations((prevSelections) => {
      const currentSelections = [...(prevSelections[custName] || [])];
      const lastIndex = currentSelections
        .map((sel) => sel._id)
        .lastIndexOf(option._id);
      if (lastIndex !== -1) {
        currentSelections.splice(lastIndex, 1);
      }

      return {
        ...prevSelections,
        [custName]: currentSelections,
      };
    });
  };

  const handleSubOptionSelect = (custName, optionIndex, subOption) => {
    setSelectedCustomizations((prevSelections) => {
      const custSelections = [...(prevSelections[custName] || [])];
      const selection = { ...custSelections[optionIndex] }; // clone selection

      if (
        selection.selectedSubOption &&
        selection.selectedSubOption._id === subOption._id
      ) {
        // Deselect if same clicked
        selection.selectedSubOption = null;
      } else {
        selection.selectedSubOption = { ...subOption };
      }

      custSelections[optionIndex] = selection; // replace with cloned version

      return {
        ...prevSelections,
        [custName]: custSelections,
      };
    });
  };

  const handleAddToCart = () => {
    let isValid = true;

    deal.customizations.forEach((cust) => {
      const totalSelected = (selectedCustomizations[cust.name] || []).length;
      if (totalSelected < cust.minSelect) {
        isValid = false;
        alert(
          `Please select at least ${cust.minSelect} option(s) for ${cust.name}.`
        );
      }
    });

    if (!isValid) return;

    let additionalPrice = 0;
    Object.values(selectedCustomizations).forEach((custSelections) => {
      custSelections.forEach((selection) => {
        additionalPrice += selection.price || 0;
        if (selection.selectedSubOption) {
          additionalPrice += selection.selectedSubOption.price || 0;
        }
      });
    });

    const calculatedFinalPrice = deal.dealPrice + additionalPrice;

    const dealToAdd = {
      ...deal,
      dealId: deal._id,
      quantity: 1,
      selectedCustomizations: selectedCustomizations,
      finalPrice: calculatedFinalPrice,
      type: "deal",
    };

    console.log("deal to add beto", dealToAdd);

    dispatch(addDealToCart(dealToAdd));
    onClose();
  };

  const getTotalSelected = (custName) => {
    return (selectedCustomizations[custName] || []).length;
  };

  const getOptionCount = (custName, optionId) => {
    return (selectedCustomizations[custName] || []).filter(
      (opt) => opt._id === optionId
    ).length;
  };

  const getOptionIndices = (custName, optionId) => {
    const selections = selectedCustomizations[custName] || [];
    const indices = [];
    for (let i = 0; i < selections.length; i++) {
      if (selections[i]._id === optionId) {
        indices.push(i);
      }
    }
    return indices;
  };

  const isSubOptionSelected = (custName, optionIndex, subOptionId) => {
    const selections = selectedCustomizations[custName] || [];
    if (optionIndex >= selections.length) return false;

    const selection = selections[optionIndex];
    return (
      selection.selectedSubOption &&
      selection.selectedSubOption._id === subOptionId
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#333] flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white truncate">
            {deal.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {deal.description && (
            <p className="text-[#a0a0a0] text-sm mb-4">{deal.description}</p>
          )}

          {/* Included Items */}
          {deal.items && deal.items.length > 0 && (
            <div className="mb-6 pb-4 border-b border-[#2a2a2a]">
              <h3 className="text-white text-lg font-medium mb-3">
                Included Items
              </h3>
              <div className="flex flex-col gap-2">
                {deal.items.map((item, index) => (
                  <div
                    key={index}
                    className="text-[#a0a0a0] text-sm bg-[#2a2a2a] p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="font-medium text-white">
                      {item.itemId?.name || "Unknown Item"}
                    </span>
                    <span className="text-xs">Quantity: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          {deal.customizations && deal.customizations.length > 0 ? (
            deal.customizations.map((customization, custIndex) => {
              const totalSelected = getTotalSelected(customization.name);
              const maxReached = totalSelected >= customization.maxSelect;

              return (
                <div
                  key={custIndex}
                  className="mb-6 pb-4 border-b border-[#2a2a2a] last:border-b-0"
                >
                  <h3 className="text-white text-lg font-medium mb-3">
                    {customization.name}
                    <span className="text-sm text-[#a0a0a0] ml-2">
                      (Selected: {totalSelected} of {customization.minSelect} -{" "}
                      {customization.maxSelect})
                    </span>
                    {maxReached && (
                      <span className="text-sm text-amber-400 ml-2">
                        Maximum reached
                      </span>
                    )}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {customization.options.map((option, optIndex) => {
                      const optionCount = getOptionCount(
                        customization.name,
                        option._id
                      );
                      const optionIndices = getOptionIndices(
                        customization.name,
                        option._id
                      );

                      return (
                        <div key={optIndex} className="w-full">
                          <div
                            className={`flex flex-col p-3 rounded-lg border transition-colors mb-2
                              ${
                                optionCount > 0
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-[#2a2a2a] border-[#444] text-[#a0a0a0] hover:bg-[#3a3a3a]"
                              }`}
                          >
                            {/* Main option */}
                            <div className="flex items-center justify-between w-full mb-2">
                              <span className="font-medium">{option.name}</span>
                              {option.price > 0 && (
                                <span className="text-xs text-green-300 ml-2">
                                  +Rs{option.price}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleOptionRemove(customization.name, option)
                                }
                                disabled={optionCount === 0}
                                className="p-1 rounded-full bg-[#333] hover:bg-[#444] disabled:opacity-30"
                              >
                                <FaMinus size={12} />
                              </button>

                              <span className="text-sm font-medium min-w-[20px] text-center">
                                {optionCount}
                              </span>

                              <button
                                onClick={() =>
                                  handleOptionAdd(customization.name, option)
                                }
                                disabled={maxReached}
                                className="p-1 rounded-full bg-[#333] hover:bg-[#444] disabled:opacity-30"
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>

                            {/* Sub Options */}
                            {optionCount > 0 &&
                              option.subOptions &&
                              option.subOptions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-[#444]">
                                  <h4 className="text-[#a0a0a0] text-sm font-medium mb-2">
                                    Choose one sub-option for each selection:
                                  </h4>

                                  {optionIndices.map(
                                    (optionIndex, instanceIndex) => (
                                      <div key={instanceIndex} className="mb-3">
                                        <p className="text-xs text-[#aaa] mb-1">
                                          {option.name} - Selection{" "}
                                          {instanceIndex + 1}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {option.subOptions.map(
                                            (subOption, subIndex) => {
                                              const isSelected =
                                                isSubOptionSelected(
                                                  customization.name,
                                                  optionIndex,
                                                  subOption._id
                                                );

                                              return (
                                                <div
                                                  key={subIndex}
                                                  className={`flex items-center justify-between p-2 rounded border transition-colors cursor-pointer
                                                    ${
                                                      isSelected
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : "bg-[#2a2a2a] border-[#555] text-[#a0a0a0] hover:bg-[#3a3a3a]"
                                                    }`}
                                                  onClick={() =>
                                                    handleSubOptionSelect(
                                                      customization.name,
                                                      optionIndex,
                                                      subOption
                                                    )
                                                  }
                                                >
                                                  <div className="flex items-center">
                                                    <div
                                                      className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                                                        isSelected
                                                          ? "bg-white border-white"
                                                          : "border-[#a0a0a0]"
                                                      }`}
                                                    >
                                                      {isSelected && (
                                                        <FaCheck
                                                          size={8}
                                                          className="text-blue-500"
                                                        />
                                                      )}
                                                    </div>
                                                    <span className="text-sm">
                                                      {subOption.name}
                                                    </span>
                                                  </div>
                                                  {subOption.price > 0 && (
                                                    <span className="text-xs text-green-300">
                                                      +Rs{subOption.price}
                                                    </span>
                                                  )}
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[#a0a0a0] text-center py-8">
              No customization options available for this deal.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#333]">
          <div className="flex justify-between items-center">
            <div className="text-white font-bold text-xl sm:text-2xl">
              Total: Rs
              {deal.dealPrice +
                Object.values(selectedCustomizations).reduce(
                  (total, custSelections) => {
                    custSelections.forEach((selection) => {
                      total += selection.price || 0;
                      if (selection.selectedSubOption) {
                        total += selection.selectedSubOption.price || 0;
                      }
                    });
                    return total;
                  },
                  0
                )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealOptionsModal;
