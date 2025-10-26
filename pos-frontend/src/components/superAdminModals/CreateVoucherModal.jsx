import React, { useState, useEffect } from 'react';
import { createVoucher, getAllMenuOfAdmin } from '../../https/index';

const CreateVoucherModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  allAdmins = [],
  isLoadingAdmins = false,
  selectedAdmin = null
}) => {
  const [voucherFormData, setVoucherFormData] = useState({
    menuId: '',
    code: '',
    voucherPrice: ''
  });
  const [isCreatingVoucher, setIsCreatingVoucher] = useState(false);
  const [voucherCreationError, setVoucherCreationError] = useState('');
  const [voucherCreationSuccess, setVoucherCreationSuccess] = useState('');
  const [adminMenus, setAdminMenus] = useState([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setVoucherFormData({
        menuId: '',
        code: '',
        voucherPrice: ''
      });
      setVoucherCreationError('');
      setVoucherCreationSuccess('');
      setAdminMenus([]);
      
      // If we have a selected admin, fetch menus immediately
      if (selectedAdmin?._id) {
        fetchMenusForAdmin(selectedAdmin._id);
      }
    }
  }, [isOpen, selectedAdmin]);

  // Fetch menus for specific admin
  const fetchMenusForAdmin = async (adminId) => {
    if (!adminId) {
      setAdminMenus([]);
      return;
    }
    
    setIsLoadingMenus(true);
    try {
      const response = await getAllMenuOfAdmin(adminId);
      if (response.data?.success) {
        setAdminMenus(response.data.data || []);
      } else {
        setAdminMenus([]);
      }
    } catch (error) {
      console.error('Error fetching menus for admin:', error);
      setAdminMenus([]);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  const handleVoucherFormChange = (e) => {
    const { name, value } = e.target;
    setVoucherFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (voucherCreationError) {
      setVoucherCreationError('');
    }
  };

  const handleCreateVoucher = async () => {
    // Reset any previous errors or success messages
    setVoucherCreationError('');
    setVoucherCreationSuccess('');
    
    // Validate required fields
    const { menuId, code, voucherPrice } = voucherFormData;
    if (!menuId || !code || !voucherPrice) {
      setVoucherCreationError('Please fill in all required fields');
      return;
    }
    
    // Validate code
    const codeNumber = parseInt(code);
    if (isNaN(codeNumber) || codeNumber <= 0) {
      setVoucherCreationError('Voucher code must be a positive number');
      return;
    }

    // Validate price
    const priceNumber = parseFloat(voucherPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setVoucherCreationError('Voucher price must be a positive number');
      return;
    }
    
    setIsCreatingVoucher(true);
    
    try {
      const response = await createVoucher({
        menuId,
        code: codeNumber,
        voucherPrice: priceNumber
      });
      
      if (response.data?.success) {
        setVoucherCreationSuccess('Voucher created successfully!');
        
        // Reset form after successful creation
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setVoucherCreationError('Failed to create voucher. Please try again.');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      
      if (error.response?.data) {
        const { message } = error.response.data;
        setVoucherCreationError(message || 'Failed to create voucher');
        
        if (error.response.status === 400) {
          if (message?.includes('Voucher code already exists')) {
            setVoucherCreationError('This voucher code already exists. Please use a different code.');
          }
        }
      } else {
        setVoucherCreationError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsCreatingVoucher(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Create Voucher</h2>
        
        {voucherCreationError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-100 text-sm">{voucherCreationError}</p>
          </div>
        )}
        
        {voucherCreationSuccess && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-100 text-sm">{voucherCreationSuccess}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Select Menu *</label>
            <select 
              name="menuId"
              value={voucherFormData.menuId}
              onChange={handleVoucherFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              disabled={isCreatingVoucher || isLoadingMenus || !selectedAdmin}
            >
              <option value="">
                {isLoadingMenus ? 'Loading menus...' : 'Select menu...'}
              </option>
              {adminMenus.length === 0 && !isLoadingMenus ? (
                <option disabled>No menus available for this admin</option>
              ) : (
                adminMenus.map(menu => (
                  <option key={menu._id} value={menu._id}>
                    {menu.name}
                  </option>
                ))
              )}
            </select>
            {!selectedAdmin && (
              <p className="text-[#a0a0a0] text-xs mt-1">Please select an admin first to load menus</p>
            )}
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Voucher Code *</label>
            <input 
              type="number" 
              name="code"
              value={voucherFormData.code}
              onChange={handleVoucherFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter voucher code (e.g., 12345)"
              disabled={isCreatingVoucher}
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Voucher Price (Rs) *</label>
            <input 
              type="number" 
              name="voucherPrice"
              value={voucherFormData.voucherPrice}
              onChange={handleVoucherFormChange}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter voucher price"
              disabled={isCreatingVoucher}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="flex justify-between gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isCreatingVoucher}
            className={`px-4 py-2 rounded-lg ${
              isCreatingVoucher 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreateVoucher}
            disabled={isCreatingVoucher || !voucherFormData.menuId || !voucherFormData.code || !voucherFormData.voucherPrice}
            className={`px-6 py-2 rounded-lg font-medium ${
              isCreatingVoucher || !voucherFormData.menuId || !voucherFormData.code || !voucherFormData.voucherPrice
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                : 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
            }`}
          >
            {isCreatingVoucher ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Voucher'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVoucherModal;
