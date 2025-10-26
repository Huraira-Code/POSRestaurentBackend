import React, { useState, useEffect } from 'react';
import { createCategory, importCategories, getCategoriesForAdmin } from '../../https/index';

const CreateCategoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  allAdmins = [],
  createdUser = null,
  createdCategories = [],
  isLoadingAdmins = false,
  selectedAdmin = null,
  onCategoryCreated = null, // New callback for refreshing admin categories
  onImportSuccess = null, // New callback for showing import success notifications
  isSetupWizard = false, // New prop to indicate Setup Wizard context
  isSettings = false // New prop to indicate Settings context
}) => {
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    adminId: ''
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryCreationError, setCategoryCreationError] = useState('');
  const [categoryCreationSuccess, setCategoryCreationSuccess] = useState('');
  
  // Import categories states
  const [showImportSection, setShowImportSection] = useState(false);
  const [importFromAdminId, setImportFromAdminId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [availableAdminsForImport, setAvailableAdminsForImport] = useState([]);

  // Reset form when modal opens and pre-select admin if selectedAdmin is provided
  useEffect(() => {
    if (isOpen) {
      setCategoryFormData({
        name: '',
        adminId: isSetupWizard && createdUser ? createdUser.id : (selectedAdmin?._id || '')
      });
      setCategoryCreationError('');
      setCategoryCreationSuccess('');
      setShowImportSection(false);
      setImportFromAdminId('');
      setImportError('');
      setImportSuccess('');
      
      // Set available admins for import (exclude the target admin)
      const targetAdminId = isSetupWizard && createdUser ? createdUser.id : (selectedAdmin?._id || '');
      if (targetAdminId) {
        const filteredAdmins = allAdmins.filter(admin => admin._id !== targetAdminId);
        setAvailableAdminsForImport(filteredAdmins);
      } else {
        setAvailableAdminsForImport(allAdmins);
      }
    }
  }, [isOpen, selectedAdmin, isSetupWizard, isSettings, createdUser, allAdmins]);

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (categoryCreationError) {
      setCategoryCreationError('');
    }
  };

  const handleCreateCategory = async () => {
    // Reset any previous errors or success messages
    setCategoryCreationError('');
    setCategoryCreationSuccess('');
    
    // Validate required fields
    const { name, adminId } = categoryFormData;
    if (!name || !adminId) {
      setCategoryCreationError('Both category name and admin selection are required!');
      return;
    }
    
    // Validate category name
    if (name.trim().length < 2) {
      setCategoryCreationError('Category name must be at least 2 characters long!');
      return;
    }
    
    setIsCreatingCategory(true);
    
    try {
      console.log('Creating category:', categoryFormData);
      
      const response = await createCategory({
        name: name.trim(),
        adminId: adminId
      });
      
      console.log('Category created successfully:', response);
      
      // Show success message
      setCategoryCreationSuccess('Category created successfully!');
      
      // Add the created category to the list
      const newCategory = {
        id: response.data.data._id || Date.now(),
        name: response.data.data.name,
        adminId: response.data.data.adminId,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      // Call onSuccess for wizard flow (append to existing categories)
      if (onSuccess) {
        onSuccess(2, newCategory.name);
      }
      
      // If we have selectedAdmin context and callback, refresh the categories
      if (selectedAdmin && onCategoryCreated) {
        onCategoryCreated(selectedAdmin._id);
      }
      
      // Clear form for next category creation but keep modal open
      setCategoryFormData(prev => ({
        ...prev,
        name: ''
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCategoryCreationSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create category:', error);
      
      // Handle different error scenarios
      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        setCategoryCreationError(message || 'Failed to create category');
        
        if (error.response.status === 400) {
          console.warn('Validation error:', { message, serverError });
        } else if (error.response.status === 401) {
          console.warn('Unauthorized - invalid or missing token');
          setCategoryCreationError('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          console.warn('Access denied - insufficient permissions');
          setCategoryCreationError('Access denied. You do not have permission to create categories.');
        } else if (error.response.status === 500) {
          console.error('Server error during category creation');
          setCategoryCreationError('Server error. Please try again later.');
        }
      } else if (error.request) {
        console.error('Network error - unable to reach server:', error.request);
        setCategoryCreationError('Network error. Please check your connection and try again.');
      } else {
        console.error('Unexpected error during category creation:', error.message);
        setCategoryCreationError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleImportCategories = async () => {
    if (!importFromAdminId || !categoryFormData.adminId) {
      setImportError('Please select both source admin and target admin');
      return;
    }

    if (importFromAdminId === categoryFormData.adminId) {
      setImportError('Source and target admin cannot be the same');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const response = await importCategories({
        sourceAdminId: importFromAdminId,
        targetAdminId: categoryFormData.adminId
      });

      const importedCategories = response.data.data || [];
      const categoryCount = importedCategories.length;
      const successMessage = `🎉 Successfully imported ${categoryCount} categories! They are now available for creating menu items.`;
      setImportSuccess(successMessage);
      
      // Call parent notification if available
      if (onImportSuccess) {
        onImportSuccess(successMessage);
      }
      
      // Update step completion tracking for Setup Wizard
      if (onSuccess && isSetupWizard) {
        // For setup wizard, call onSuccess with imported data to update tracking
        onSuccess(2, importedCategories);
      }
      
      // Refresh categories if callback is available
      if (selectedAdmin && onCategoryCreated) {
        onCategoryCreated(selectedAdmin._id);
      }

      // Reset import form
      setImportFromAdminId('');
      setShowImportSection(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setImportSuccess('');
      }, 5000);

    } catch (error) {
      console.error('Failed to import categories:', error);
      
      if (error.response?.data) {
        setImportError(error.response.data.message || 'Failed to import categories');
      } else {
        setImportError('An error occurred while importing categories');
      }
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[450px] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-2">Create Category</h2>
        <p className="text-[#a0a0a0] text-sm mb-6">
          Create categories for organizing menu items. You can create multiple categories.
        </p>
        
        {/* Error/Success Messages */}
        {categoryCreationError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">{categoryCreationError}</p>
          </div>
        )}
        
        {categoryCreationSuccess && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-300 text-sm">{categoryCreationSuccess}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryFormChange}
              disabled={isCreatingCategory}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter category name (e.g., Appetizers)"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
              Assign to Admin <span className="text-red-400">*</span>
            </label>
            <select 
              name="adminId"
              value={categoryFormData.adminId}
              onChange={handleCategoryFormChange}
              disabled={isCreatingCategory || isLoadingAdmins}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingAdmins ? 'Loading admins...' : 'Select an admin...'}
              </option>
              {/* In Setup Wizard, only show the created user */}
              {/* In Settings, only show the selected admin */}
              {isSetupWizard ? (
                createdUser && (
                  <option value={createdUser.id}>
                    {createdUser.name} ({createdUser.email}) - {createdUser.role}
                  </option>
                )
              ) : isSettings && selectedAdmin ? (
                <option value={selectedAdmin._id}>
                  {selectedAdmin.name} ({selectedAdmin.email}) - {selectedAdmin.role || 'Admin'}
                </option>
              ) : (
                <>
                  {/* Show created user first if exists and not in Setup Wizard */}
                  {createdUser && (
                    <option value={createdUser.id}>
                      {createdUser.name} ({createdUser.email}) - {createdUser.role}
                    </option>
                  )}
                  {/* Show all other admins */}
                  {allAdmins.map(admin => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} ({admin.email}) - {admin.role}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Import Categories Section */}
          {categoryFormData.adminId && availableAdminsForImport.length > 0 && (
            <div className="border-t border-[#404040] pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#f5f5f5] text-sm font-medium">Import Categories</h3>
                <button
                  type="button"
                  onClick={() => setShowImportSection(!showImportSection)}
                  className="text-[#60a5fa] text-sm hover:text-[#3b82f6] transition-colors"
                  disabled={isCreatingCategory || isImporting}
                >
                  {showImportSection ? 'Hide Import' : 'Import from another admin'}
                </button>
              </div>
              
              {showImportSection && (
                <div className="space-y-3 p-3 bg-[#262626] rounded-lg border border-[#404040]">
                  <p className="text-[#a0a0a0] text-xs">
                    Import categories from another admin to quickly set up your menu structure.
                  </p>
                  
                  {/* Import Error/Success Messages */}
                  {importError && (
                    <div className="p-2 bg-red-900/20 border border-red-500 rounded text-red-300 text-xs">
                      {importError}
                    </div>
                  )}
                  
                  {importSuccess && (
                    <div className="p-2 bg-green-900/20 border border-green-500 rounded text-green-300 text-xs">
                      {importSuccess}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[#f5f5f5] text-xs font-medium mb-2">
                      Import categories from:
                    </label>
                    <select
                      value={importFromAdminId}
                      onChange={(e) => setImportFromAdminId(e.target.value)}
                      disabled={isImporting}
                      className="w-full p-2 bg-[#1a1a1a] text-[#f5f5f5] rounded border border-[#404040] focus:border-[#60a5fa] focus:outline-none text-sm disabled:opacity-50"
                    >
                      <option value="">Select admin to import from...</option>
                      {availableAdminsForImport.map(admin => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} ({admin.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleImportCategories}
                    disabled={!importFromAdminId || isImporting}
                    className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
                      !importFromAdminId || isImporting
                        ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                        : 'bg-[#16a34a] hover:bg-[#15803d] text-white'
                    }`}
                  >
                    {isImporting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Importing...
                      </div>
                    ) : (
                      'Import Categories'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Show created categories if any */}
          {createdCategories.length > 0 && (
            <div className="mt-4 p-4 bg-[#262626] rounded-lg">
              <h3 className="text-[#f5f5f5] text-sm font-medium mb-3">
                Created Categories in this Session ({createdCategories.length}):
              </h3>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {createdCategories.map((category, index) => (
                  <span key={index} className="px-2 py-1 bg-green-800 text-green-200 rounded text-xs">
                    {typeof category === 'string' ? category : category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isCreatingCategory}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isCreatingCategory 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            {createdCategories.length > 0 ? 'Done' : 'Cancel'}
          </button>
          <button 
            onClick={handleCreateCategory}
            disabled={isCreatingCategory}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isCreatingCategory
                ? 'bg-[#3b82f6] opacity-50 cursor-not-allowed text-white'
                : 'bg-[#60a5fa] hover:bg-[#3b82f6] text-white'
            }`}
          >
            {isCreatingCategory ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : createdCategories.length > 0 ? (
              'Create Another'
            ) : (
              'Create Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
