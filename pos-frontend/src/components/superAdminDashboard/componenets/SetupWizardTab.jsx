const SetupWizardTab = ({
  setupSteps,
  currentStep,
  completedSteps,
  createdUser,
  createdCategories,
  createdItems,
  createdMenu,
  setIsCreateUserModalOpen,
  setIsCreateCategoryModalOpen,
  setIsCreateItemModalOpen,
  setIsCreateMenuModalOpen,
  handleManualStepAdvance,
  setActiveTab,
}) => {
  return (
  <div className="container mx-auto px-6 md:px-4">
    <div className="bg-[#1a1a1a] rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#f5f5f5] mb-6">
        Restaurant Setup Wizard
      </h3>
      <p className="text-[#a0a0a0] mb-8">
        Follow these steps to set up a complete restaurant system
      </p>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {setupSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                  completedSteps.includes(step.id)
                    ? "bg-green-600 text-white"
                    : currentStep === step.id
                    ? "bg-[#60a5fa] text-white"
                    : "bg-[#404040] text-[#a0a0a0]"
                }`}
              >
                {completedSteps.includes(step.id) ? "✓" : step.id}
              </div>
              <span
                className={`text-xs text-center ${
                  completedSteps.includes(step.id) || currentStep === step.id
                    ? "text-[#f5f5f5]"
                    : "text-[#a0a0a0]"
                }`}
              >
                {step.title}
              </span>
              {index < setupSteps.length - 1 && (
                <div
                  className={`w-full h-1 mt-4 ${
                    completedSteps.includes(step.id)
                      ? "bg-green-600"
                      : "bg-[#404040]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Create User */}
        <div
          className={`p-6 rounded-lg border-2 ${
            currentStep === 1
              ? "border-[#60a5fa] bg-[#262626]"
              : completedSteps.includes(1)
              ? "border-green-600 bg-[#1a2e1a]"
              : "border-[#404040] bg-[#1a1a1a] opacity-50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-[#f5f5f5] mb-2">
                Step 1: Create User Account
              </h4>
              <p className="text-[#a0a0a0] text-sm">
                Create a user account that will manage the restaurant
              </p>
              {createdUser && (
                <div className="mt-3 p-3 bg-[#1a2e1a] rounded border border-green-600">
                  <p className="text-green-300 text-sm">
                    ✓ User created: {createdUser.email} ({createdUser.role})
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              disabled={completedSteps.includes(1)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                completedSteps.includes(1)
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : currentStep === 1
                  ? "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                  : "bg-[#404040] text-[#a0a0a0] cursor-not-allowed"
              }`}
            >
              {completedSteps.includes(1) ? "Completed" : "Create User"}
            </button>
          </div>
        </div>

        {/* Step 2: Create Categories */}
        <div
          className={`p-6 rounded-lg border-2 ${
            currentStep === 2
              ? "border-[#60a5fa] bg-[#262626]"
              : completedSteps.includes(2)
              ? "border-green-600 bg-[#1a2e1a]"
              : "border-[#404040] bg-[#1a1a1a] opacity-50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#f5f5f5] mb-2">
                Step 2: Create Categories ({createdCategories.length} created)
              </h4>
              <p className="text-[#a0a0a0] text-sm">
                Create multiple categories for organizing your menu items
              </p>
              {createdCategories.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a2e1a] rounded border border-green-600">
                  <p className="text-green-300 text-sm mb-2">
                    ✓ Categories created ({createdCategories.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {createdCategories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-800 text-green-200 rounded text-xs"
                      >
                        {typeof category === "string"
                          ? category
                          : category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => setIsCreateCategoryModalOpen(true)}
                disabled={currentStep < 2 || completedSteps.includes(2)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  completedSteps.includes(2)
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : currentStep === 2
                    ? "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                    : "bg-[#404040] text-[#a0a0a0] cursor-not-allowed"
                }`}
              >
                {completedSteps.includes(2) ? "Completed" : "Add Category"}
              </button>
              {currentStep === 2 &&
                createdCategories.length > 0 &&
                !completedSteps.includes(2) && (
                  <button
                    onClick={() => handleManualStepAdvance(2)}
                    className="px-4 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    Continue to Items →
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Step 3: Create Items */}
        <div
          className={`p-6 rounded-lg border-2 ${
            currentStep === 3
              ? "border-[#60a5fa] bg-[#262626]"
              : completedSteps.includes(3)
              ? "border-green-600 bg-[#1a2e1a]"
              : "border-[#404040] bg-[#1a1a1a] opacity-50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#f5f5f5] mb-2">
                Step 3: Create Items ({createdItems.length} created)
              </h4>
              <p className="text-[#a0a0a0] text-sm">
                Add multiple menu items with pictures and assign to categories
              </p>
              {createdItems.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a2e1a] rounded border border-green-600">
                  <p className="text-green-300 text-sm mb-2">
                    ✓ Items created ({createdItems.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {createdItems.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-800 text-green-200 rounded text-xs"
                      >
                        {typeof item === "string" ? item : item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => setIsCreateItemModalOpen(true)}
                disabled={currentStep < 3 || completedSteps.includes(3)}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  completedSteps.includes(3)
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : currentStep === 3
                    ? "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                    : "bg-[#404040] text-[#a0a0a0] cursor-not-allowed"
                }`}
              >
                {completedSteps.includes(3) ? "Completed" : "Add Item"}
              </button>
              {currentStep === 3 &&
                createdItems.length > 0 &&
                !completedSteps.includes(3) && (
                  <button
                    onClick={() => handleManualStepAdvance(3)}
                    className="px-4 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    Continue to Menu →
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Step 4: Create Menu */}
        <div
          className={`p-6 rounded-lg border-2 ${
            currentStep === 4
              ? "border-[#60a5fa] bg-[#262626]"
              : completedSteps.includes(4)
              ? "border-green-600 bg-[#1a2e1a]"
              : "border-[#404040] bg-[#1a1a1a] opacity-50"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-[#f5f5f5] mb-2">
                Step 4: Create Menu
              </h4>
              <p className="text-[#a0a0a0] text-sm">
                Create the final menu with logo, name and select items to
                include
              </p>
              {createdMenu && (
                <div className="mt-3 p-3 bg-[#1a2e1a] rounded border border-green-600">
                  <p className="text-green-300 text-sm">
                    ✓ Menu created: {createdMenu.name}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCreateMenuModalOpen(true)}
              disabled={currentStep < 4 || completedSteps.includes(4)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                completedSteps.includes(4)
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : currentStep === 4
                  ? "bg-[#60a5fa] hover:bg-[#3b82f6] text-white"
                  : "bg-[#404040] text-[#a0a0a0] cursor-not-allowed"
              }`}
            >
              {completedSteps.includes(4) ? "Completed" : "Create Menu"}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {completedSteps.length === 4 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-600">
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-100 mb-2">
              Setup Complete!
            </h3>
            <p className="text-green-200 mb-4">
              Your restaurant system is now ready with user, categories, items,
              and menu. The setup process has been completed successfully!
            </p>
            <button
              onClick={() => setActiveTab("All Admins")}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              Go to All Admins
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)};

export default SetupWizardTab;
