import React, { useState, useEffect } from 'react';
import { createMenu, getAllItemsOfAdmin, importMenus, assignItemsToImportedMenu, getAllMenuOfAdmin } from '../../https/index';

const CreateMenuModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  allAdmins = [],
  createdUser = null,
  isLoadingAdmins = false,
  selectedAdmin = null,
  onMenuCreated = null, // New callback for refreshing admin menu
  isSetupWizard = false, // New prop to indicate Setup Wizard context
  isSettings = false // New prop to indicate Settings context
}) => {
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    adminId: '',
    itemsID: []
  });
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [menuCreationError, setMenuCreationError] = useState('');
  const [menuCreationSuccess, setMenuCreationSuccess] = useState('');
  const [adminItems, setAdminItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  
  // Import menus state
  const [sourceAdmin, setSourceAdmin] = useState('');
  const [importedMenus, setImportedMenus] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [menuItemAssignments, setMenuItemAssignments] = useState({});
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  
  // Logo upload states
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Reset form when modal opens and pre-select admin if selectedAdmin is provided
  useEffect(() => {
    if (isOpen) {
      const preselectedAdminId = isSetupWizard && createdUser ? createdUser.id : (selectedAdmin?._id || '');
      setMenuFormData({
        name: '',
        adminId: preselectedAdminId,
        itemsID: []
      });
      setMenuCreationError('');
      setMenuCreationSuccess('');
      setAdminItems([]);
      
      // Reset logo states
      setSelectedLogo(null);
      setLogoPreview('');
      setIsUploadingLogo(false);
      
      // Reset import states
      setSourceAdmin('');
      setImportedMenus([]);
      setMenuItemAssignments({});
      setImportError('');
      setImportSuccess('');
      
      // If we have a preselected admin, fetch items immediately
      if (preselectedAdminId) {
        fetchItemsForAdmin(preselectedAdminId);
      }
    }
  }, [isOpen, selectedAdmin, isSetupWizard, isSettings, createdUser]);

  // Fetch items for specific admin
  const fetchItemsForAdmin = async (adminId) => {
    if (!adminId) {
      setAdminItems([]);
      return;
    }
    
    setIsLoadingItems(true);
    try {
      const response = await getAllItemsOfAdmin(adminId);
      if (response.data?.success) {
        setAdminItems(response.data.data || []);
      } else {
        setAdminItems([]);
      }
    } catch (error) {
      console.error('Error fetching items for admin:', error);
      setAdminItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleMenuFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'itemsID') {
      // Handle multiple select for items
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setMenuFormData(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else if (name === 'adminId') {
      // Handle admin selection and fetch items
      setMenuFormData(prev => ({
        ...prev,
        [name]: value,
        itemsID: [] // Reset items selection when admin changes
      }));
      
      // Fetch items when admin is selected
      if (value) {
        fetchItemsForAdmin(value);
      } else {
        setAdminItems([]); // Clear items if no admin selected
      }
    } else {
      setMenuFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (menuCreationError) {
      setMenuCreationError('');
    }
  };

  // Logo handling functions
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMenuCreationError('Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMenuCreationError('Logo size should be less than 5MB');
        return;
      }
      
      setSelectedLogo(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      setMenuCreationError('');
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setLogoPreview('');
    // Reset the file input
    const fileInput = document.getElementById('menu-logo-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Import menus functionality
  const handleImportMenus = async () => {
    if (!sourceAdmin) {
      setImportError('Please select a source admin');
      return;
    }

    const selectedAdminId = isSetupWizard && createdUser ? createdUser.id : (selectedAdmin?._id || '');
    if (!selectedAdminId) {
      setImportError('No target admin selected');
      return;
    }

    if (sourceAdmin === selectedAdminId) {
      setImportError('Source and target admin cannot be the same');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const response = await importMenus({
        sourceAdminId: sourceAdmin,
        targetAdminId: selectedAdminId
      });
      
      if (response.data?.success) {
        setImportedMenus(response.data.data || []);
        setImportSuccess(`Successfully imported ${response.data.data?.length || 0} menus`);
        
        // Initialize item assignments for each imported menu
        const assignments = {};
        response.data.data.forEach(menu => {
          assignments[menu._id] = [];
        });
        setMenuItemAssignments(assignments);
      } else {
        setImportError('Failed to import menus');
      }
    } catch (error) {
      console.error('Error importing menus:', error);
      setImportError(error.response?.data?.message || 'Failed to import menus');
    } finally {
      setIsImporting(false);
    }
  };

  const handleAssignItemsToMenu = async (menuId) => {
    const selectedItems = menuItemAssignments[menuId] || [];
    if (selectedItems.length === 0) {
      setImportError('Please select at least one item for this menu');
      return;
    }

    setIsAssigning(true);
    setImportError('');

    try {
      const response = await assignItemsToImportedMenu({
        menuId: menuId,
        itemIds: selectedItems
      });
      
      if (response.data?.success) {
        setImportSuccess(`Items assigned to menu successfully`);
        
        // Update the menu in the imported menus list
        setImportedMenus(prev => prev.map(menu => 
          menu._id === menuId 
            ? { ...menu, itemsAssigned: true }
            : menu
        ));
      } else {
        setImportError('Failed to assign items to menu');
      }
    } catch (error) {
      console.error('Error assigning items to menu:', error);
      setImportError(error.response?.data?.message || 'Failed to assign items');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleMenuItemAssignmentChange = (menuId, itemIds) => {
    setMenuItemAssignments(prev => ({
      ...prev,
      [menuId]: itemIds
    }));
  };

  const handleCreateMenu = async () => {
    // Reset any previous errors or success messages
    setMenuCreationError('');
    setMenuCreationSuccess('');
    
    // Validate required fields
    const { name, adminId, itemsID } = menuFormData;
    if (!name || !adminId) {
      setMenuCreationError('Please fill in all required fields');
      return;
    }
    
    // Validate menu name
    if (name.trim().length < 2) {
      setMenuCreationError('Menu name must be at least 2 characters long');
      return;
    }

    // Check if at least one item is selected
    if (!itemsID || itemsID.length === 0) {
      setMenuCreationError('Please select at least one item for the menu');
      return;
    }

    // Validate logo upload
    if (!selectedLogo) {
      setMenuCreationError('Please select a logo for the menu');
      return;
    }
    
    setIsCreatingMenu(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('adminId', adminId);
      formData.append('itemsID', JSON.stringify(itemsID));
      
      // Only append logo if it exists
      if (selectedLogo) {
        formData.append('logo', selectedLogo);
        console.log("Logo file attached:", selectedLogo.name, selectedLogo.size);
      } else {
        console.log("No logo file selected");
      }
      
      console.log("Sending menu creation request with FormData");
      const response = await createMenu(formData);
      
      if (response.data?.success) {
        setMenuCreationSuccess('Menu created successfully!');
        
        // Step completion with new menu data
        const menuData = response.data.data;
        
        // If we have selectedAdmin context and callback, refresh the menu
        if (selectedAdmin && onMenuCreated) {
          onMenuCreated(selectedAdmin._id);
        }
        
        // Reset form after successful creation
        setTimeout(() => {
          onSuccess(4, menuData);
          onClose();
        }, 1500);
      } else {
        setMenuCreationError('Failed to create menu. Please try again.');
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      
      if (error.response?.data) {
        const { message, error: serverError } = error.response.data;
        setMenuCreationError(message || 'Failed to create menu');
        
        if (error.response.status === 400) {
          console.warn('Validation error:', { message, serverError });
          if (message?.includes('Admin Does Not Exist')) {
            setMenuCreationError('Selected admin not found. Please select a valid admin.');
          } else if (message?.includes('item IDs are invalid')) {
            setMenuCreationError('One or more selected items are invalid. Please check your selection.');
          }
        } else if (error.response.status === 401) {
          console.warn('Unauthorized - invalid or missing token');
          setMenuCreationError('Authentication required. Please log in again.');
        } else if (error.response.status === 403) {
          console.warn('Access denied - insufficient permissions');
          setMenuCreationError('Access denied. You do not have permission to create menus.');
        } else if (error.response.status === 500) {
          console.error('Server error during menu creation');
          setMenuCreationError('Server error. Please try again later.');
        }
      } else if (error.request) {
        console.error('Network error - unable to reach server:', error.request);
        setMenuCreationError('Network error. Please check your connection and try again.');
      } else {
        console.error('Unexpected error during menu creation:', error.message);
        setMenuCreationError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsCreatingMenu(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Create Menu</h2>
        
        {menuCreationError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-100 text-sm">{menuCreationError}</p>
          </div>
        )}
        
        {menuCreationSuccess && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-100 text-sm">{menuCreationSuccess}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Menu Name *</label>
            <input 
              type="text" 
              name="name"
              value={menuFormData.name}
              onChange={handleMenuFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter menu name"
              disabled={isCreatingMenu}
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Admin *</label>
            <select 
              name="adminId"
              value={menuFormData.adminId}
              onChange={handleMenuFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              disabled={isCreatingMenu || isLoadingAdmins}
            >
              <option value="">
                {isLoadingAdmins ? 'Loading admins...' : 'Select admin...'}
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
                  {allAdmins.map(admin => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} ({admin.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Select Items *</label>
            <select 
              name="itemsID"
              multiple
              value={menuFormData.itemsID}
              onChange={handleMenuFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none min-h-[120px]"
              disabled={isCreatingMenu || isLoadingItems || !menuFormData.adminId}
            >
              {!menuFormData.adminId ? (
                <option disabled>Select admin first...</option>
              ) : isLoadingItems ? (
                <option disabled>Loading items...</option>
              ) : adminItems.length === 0 ? (
                <option disabled>No items available for this admin</option>
              ) : (
                adminItems.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} - Rs{item.price}
                  </option>
                ))
              )}
            </select>
            {!menuFormData.adminId && (
              <p className="text-[#a0a0a0] text-xs mt-1">Please select an admin first to load items</p>
            )}
            {menuFormData.adminId && adminItems.length === 0 && !isLoadingItems && (
              <p className="text-[#a0a0a0] text-xs mt-1">No items found for this admin. Create items first.</p>
            )}
            <p className="text-[#a0a0a0] text-xs mt-1">Hold Ctrl/Cmd to select multiple items</p>
          </div>

          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Menu Logo *</label>
            
            {/* Logo upload input */}
            <input
              id="menu-logo-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleLogoChange}
              className="hidden"
              disabled={isCreatingMenu}
            />
            
            {/* Custom upload button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => document.getElementById('menu-logo-input').click()}
                disabled={isCreatingMenu}
                className={`w-full p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                  isCreatingMenu
                    ? 'border-[#404040] bg-[#262626] text-[#606060] cursor-not-allowed'
                    : 'border-[#404040] bg-[#262626] text-[#f5f5f5] hover:border-[#60a5fa] hover:bg-[#2a2a2a]'
                }`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-2 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">
                    {selectedLogo ? 'Change Logo' : 'Upload Menu Logo'}
                  </span>
                  <span className="text-xs text-[#a0a0a0] mt-1">
                    Supported: JPG, PNG, GIF, WebP (Max 5MB)
                  </span>
                </div>
              </button>
              
              {/* Logo preview */}
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#404040]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isCreatingMenu}
                    className={`absolute top-2 right-2 p-1 rounded-full ${
                      isCreatingMenu
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
              
              {/* Selected file info */}
              {selectedLogo && (
                <div className="text-xs text-[#a0a0a0]">
                  <p>Selected: {selectedLogo.name}</p>
                  <p>Size: {(selectedLogo.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Import Menus Section */}
        <div className="mt-8 pt-6 border-t border-[#404040]">
          <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Import Menus from Another Admin</h3>
          
          {importError && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-100 text-sm">{importError}</p>
            </div>
          )}
          
          {importSuccess && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
              <p className="text-green-100 text-sm">{importSuccess}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Source Admin</label>
                <select 
                  value={sourceAdmin}
                  onChange={(e) => {
                    setSourceAdmin(e.target.value);
                    // Clear errors when user changes selection
                    if (importError) {
                      setImportError('');
                    }
                  }}
                  className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
                  disabled={isImporting || isAssigning}
                >
                  <option value="">Select source admin...</option>
                  {allAdmins
                    .filter(admin => {
                      const currentAdminId = isSetupWizard && createdUser ? createdUser.id : (selectedAdmin?._id || '');
                      return admin._id !== currentAdminId;
                    })
                    .map(admin => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleImportMenus}
                  disabled={!sourceAdmin || isImporting || isAssigning}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    !sourceAdmin || isImporting || isAssigning
                      ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isImporting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    'Import Menus'
                  )}
                </button>
              </div>
            </div>
            
            {/* Imported Menus List */}
            {importedMenus.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-[#f5f5f5]">Assign Items to Imported Menus</h4>
                {importedMenus.map(menu => (
                  <div key={menu._id} className="bg-[#262626] p-4 rounded-lg border border-[#404040]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h5 className="font-medium text-[#f5f5f5]">{menu.name}</h5>
                        {menu.itemsAssigned && (
                          <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                            Items Assigned
                          </span>
                        )}
                      </div>
                      {menu.logo && (
                        <img
                          src={menu.logo}
                          alt={`${menu.name} logo`}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[#f5f5f5] text-sm font-medium mb-2">
                          Select Items for {menu.name}
                        </label>
                        <select 
                          multiple
                          value={menuItemAssignments[menu._id] || []}
                          onChange={(e) => {
                            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                            handleMenuItemAssignmentChange(menu._id, selectedOptions);
                          }}
                          className="w-full p-3 bg-[#1a1a1a] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none min-h-[100px]"
                          disabled={isAssigning || menu.itemsAssigned}
                        >
                          {adminItems.length === 0 ? (
                            <option disabled>No items available (select admin first)</option>
                          ) : (
                            adminItems.map(item => (
                              <option key={item._id} value={item._id}>
                                {item.name} - Rs{item.price}
                              </option>
                            ))
                          )}
                        </select>
                        <p className="text-[#a0a0a0] text-xs mt-1">Hold Ctrl/Cmd to select multiple items</p>
                      </div>
                      
                      <button
                        onClick={() => handleAssignItemsToMenu(menu._id)}
                        disabled={
                          isAssigning || 
                          menu.itemsAssigned || 
                          !menuItemAssignments[menu._id] || 
                          menuItemAssignments[menu._id].length === 0
                        }
                        className={`w-full py-2 rounded-lg font-medium ${
                          isAssigning || 
                          menu.itemsAssigned || 
                          !menuItemAssignments[menu._id] || 
                          menuItemAssignments[menu._id].length === 0
                            ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isAssigning ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Assigning Items...
                          </div>
                        ) : menu.itemsAssigned ? (
                          'Items Assigned ✓'
                        ) : (
                          `Assign ${menuItemAssignments[menu._id]?.length || 0} Items to Menu`
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isCreatingMenu}
            className={`px-4 py-2 rounded-lg ${
              isCreatingMenu 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateMenu}
            disabled={isCreatingMenu || !menuFormData.name || !menuFormData.adminId || menuFormData.itemsID.length === 0 || !selectedLogo}
            className={`px-6 py-2 rounded-lg font-medium ${
              isCreatingMenu || !menuFormData.name || !menuFormData.adminId || menuFormData.itemsID.length === 0 || !selectedLogo
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                : 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
            }`}
          >
            {isCreatingMenu ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Menu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuModal;
