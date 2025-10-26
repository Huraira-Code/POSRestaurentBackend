import React, { useState, useCallback, useEffect } from 'react';
import { removeItemFromMenu } from '../../https/index';

const EditMenuModal = ({ 
  menuData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  onAddItem, 
  availableItems = [], 
  newlyAddedItemId = null,
  enableImmediateRemoval = false, // New prop to enable immediate API calls for item removal
  onItemRemoved = null // Callback when item is removed via API
}) => {
  const [formData, setFormData] = useState({
    name: menuData?.name || '',
    description: menuData?.description || ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoError, setLogoError] = useState('');
  const [selectedItems, setSelectedItems] = useState(menuData?.itemsID || []);
  const [autoAddNotification, setAutoAddNotification] = useState('');
  const [removingItems, setRemovingItems] = useState(new Set()); // Track items being removed
  const [removalError, setRemovalError] = useState('');

  useEffect(() => {
    console.log('EditMenuModal received menuData:', menuData);
    console.log('EditMenuModal menuData._id:', menuData?._id);
  }, [menuData]);

  // Update selectedItems when availableItems changes (for newly added items)
  useEffect(() => {
    if (newlyAddedItemId && availableItems.length > 0) {
      // Find the newly added item
      const newItem = availableItems.find(item => item._id === newlyAddedItemId);
      if (newItem && !selectedItems.some(selected => selected._id === newlyAddedItemId)) {
        console.log('Auto-adding newly created item to menu:', newItem.name);
        setSelectedItems(prev => [...prev, newItem]);
        setAutoAddNotification(`"${newItem.name}" has been automatically added to the menu!`);
        // Clear notification after 3 seconds
        setTimeout(() => setAutoAddNotification(''), 3000);
      }
    }
  }, [newlyAddedItemId, availableItems, selectedItems]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleItemInMenu = useCallback(async (item) => {
    const isCurrentlySelected = selectedItems.some(selectedItem => selectedItem._id === item._id);
    
    if (isCurrentlySelected) {
      // Removing item from menu
      if (enableImmediateRemoval && menuData?._id) {
        // Call API to remove item immediately
        setRemovingItems(prev => new Set([...prev, item._id]));
        setRemovalError('');
        
        try {
          const response = await removeItemFromMenu({
            menuId: menuData._id,
            itemId: item._id
          });
          
          if (response.data?.success) {
            // Update local state after successful API call
            setSelectedItems(prev => prev.filter(selectedItem => selectedItem._id !== item._id));
            
            // Call callback if provided
            if (onItemRemoved) {
              onItemRemoved(item, response.data.data);
            }
          } else {
            setRemovalError(`Failed to remove ${item.name} from menu`);
          }
        } catch (error) {
          console.error('Error removing item from menu:', error);
          setRemovalError(error.response?.data?.message || `Failed to remove ${item.name} from menu`);
        } finally {
          setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item._id);
            return newSet;
          });
        }
      } else {
        // Local removal only (existing behavior)
        setSelectedItems(prev => prev.filter(selectedItem => selectedItem._id !== item._id));
      }
    } else {
      // Adding item to menu (always local)
      setSelectedItems(prev => [...prev, item]);
    }
  }, [selectedItems, enableImmediateRemoval, menuData, onItemRemoved]);

  const handleLogoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setLogoError('Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setLogoError('Logo size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setLogoError('');
    }
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview('');
    // Reset the file input
    const fileInput = document.getElementById('edit-menu-logo-input');
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit({
        _id: menuData?._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        itemsID: selectedItems,
        pictureURL: menuData?.pictureURL,
        adminId: menuData?.adminId
      }, logoFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#404040] max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 pb-4 border-b border-[#404040]">
          <h3 className="text-lg font-semibold text-[#f5f5f5]">Edit Menu</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Auto-add notification */}
          {autoAddNotification && (
            <div className="mb-4 p-3 bg-green-900 border border-green-600 rounded-lg">
              <p className="text-green-200 text-sm font-medium">✓ {autoAddNotification}</p>
            </div>
          )}
          
          {/* Removal error notification */}
          {removalError && (
            <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded-lg">
              <p className="text-red-200 text-sm font-medium">⚠ {removalError}</p>
              <button
                onClick={() => setRemovalError('')}
                className="text-red-200 hover:text-white text-xs mt-1 underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
              Menu Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50"
              placeholder="Enter menu name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#262626] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#60a5fa] focus:border-transparent resize-none disabled:opacity-50"
              rows="3"
              placeholder="Enter menu description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
              Menu Logo
            </label>
            
            {/* Logo upload input */}
            <input
              id="edit-menu-logo-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleLogoChange}
              className="hidden"
              disabled={isLoading}
            />
            
            {/* Custom upload button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => document.getElementById('edit-menu-logo-input').click()}
                disabled={isLoading}
                className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isLoading
                    ? 'border-[#404040] bg-[#262626] text-[#606060] cursor-not-allowed'
                    : 'border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#60a5fa] hover:bg-[#2a2a2a]'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 mb-2 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">
                    {logoFile ? 'Change Logo' : (logoPreview || menuData?.pictureURL ? 'Update Logo' : 'Upload Logo')}
                  </span>
                  <span className="text-xs text-[#a0a0a0] mt-1">
                    JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </div>
              </button>
              
              {/* Logo preview - show new preview or existing logo */}
              {(logoPreview || (!logoFile && menuData?.pictureURL)) && (
                <div className="relative">
                  <img
                    src={logoPreview || menuData.pictureURL}
                    alt="Logo preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#404040]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isLoading}
                    className={`absolute top-2 right-2 p-1 rounded-full ${
                      isLoading
                        ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Show error message if any */}
              {logoError && (
                <p className="text-red-500 text-sm mt-1">{logoError}</p>
              )}
            </div>
          </div>
          
          {/* Available Items Section */}
          {onAddItem && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#a0a0a0]">
                  Available Items ({availableItems.length})
                </label>
                <button
                  type="button"
                  onClick={onAddItem}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    isLoading
                      ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                      : 'bg-[#60a5fa] hover:bg-[#3b82f6] text-white'
                  }`}
                >
                  + Add New Item
                </button>
              </div>
              
              {availableItems.length > 0 ? (
                <div className="max-h-40 overflow-y-auto bg-[#262626] rounded-lg border border-[#404040] p-2 scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent">
                  <div className="space-y-1">
                    {availableItems.map((item) => {
                      const isInMenu = selectedItems.some(selectedItem => selectedItem._id === item._id);
                      return (
                        <div
                          key={item._id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-[#3a3a3a] text-xs"
                        >
                          <img
                            src={item.pictureURL || 'https://img.freepik.com/premium-psd/beautiful-food-menu-design-template_1150977-218.jpg?w=360'}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-[#f5f5f5] font-medium">{item.name}</p>
                            <p className="text-[#a0a0a0]">Rs{item.price}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleItemInMenu(item)}
                            disabled={isLoading || removingItems.has(item._id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              isLoading || removingItems.has(item._id)
                                ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                                : isInMenu
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {removingItems.has(item._id) ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                Removing...
                              </div>
                            ) : (
                              isInMenu ? 'Remove' : 'Add'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-[#262626] rounded-lg border border-[#404040]">
                  <p className="text-[#a0a0a0] text-sm mb-2">No items available</p>
                  <p className="text-[#606060] text-xs">Create items first to add them to your menu</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Items in Menu ({selectedItems.length})
              </label>
              <div className="max-h-32 overflow-y-auto bg-[#262626] rounded-lg border border-[#404040] p-2 scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent">
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-2 px-2 py-1 bg-green-900 text-green-200 rounded text-xs"
                    >
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleItemInMenu(item)}
                        disabled={isLoading || removingItems.has(item._id)}
                        className={`text-green-200 hover:text-white ${
                          removingItems.has(item._id) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {removingItems.has(item._id) ? '⟳' : '×'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLoading 
                  ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                  : 'bg-[#404040] hover:bg-[#505050] text-[#f5f5f5]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLoading || !formData.name.trim()
                  ? 'bg-[#10b981] opacity-50 cursor-not-allowed text-white'
                  : 'bg-[#10b981] hover:bg-[#059669] text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Menu'
              )}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;
