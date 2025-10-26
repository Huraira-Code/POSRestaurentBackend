import React, { useState, useEffect } from 'react';
import { updateVoucher, getAllMenuOfAdmin } from '../../https/index';

const EditVoucherModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  voucherData,
  selectedAdmin = null
}) => {
  const [voucherFormData, setVoucherFormData] = useState({
    menuId: '',
    code: '',
    voucherPrice: ''
  });
  const [isUpdatingVoucher, setIsUpdatingVoucher] = useState(false);
  const [voucherUpdateError, setVoucherUpdateError] = useState('');
  const [voucherUpdateSuccess, setVoucherUpdateSuccess] = useState('');
  const [adminMenus, setAdminMenus] = useState([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);

  // Reset form when modal opens or voucherData changes
  useEffect(() => {
    if (isOpen && voucherData) {
      setVoucherFormData({
        menuId: voucherData.menuId?._id || voucherData.menuId || '',
        code: voucherData.code?.toString() || '',
        voucherPrice: voucherData.voucherPrice?.toString() || ''
      });
      setVoucherUpdateError('');
      setVoucherUpdateSuccess('');
      
      // If we have a selected admin, fetch menus immediately
      if (selectedAdmin?._id) {
        fetchMenusForAdmin(selectedAdmin._id);
      }
    }
  }, [isOpen, voucherData, selectedAdmin]);

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
    if (voucherUpdateError) {
      setVoucherUpdateError('');
    }
  };

  const handleUpdateVoucher = async () => {
    // Reset any previous errors or success messages
    setVoucherUpdateError('');
    setVoucherUpdateSuccess('');
    
    // Validate required fields
    const { menuId, code, voucherPrice } = voucherFormData;
    if (!menuId || !code || !voucherPrice) {
      setVoucherUpdateError('Please fill in all required fields');
      return;
    }
    
    // Validate code
    const codeNumber = parseInt(code);
    if (isNaN(codeNumber) || codeNumber <= 0) {
      setVoucherUpdateError('Voucher code must be a positive number');
      return;
    }

    // Validate price
    const priceNumber = parseFloat(voucherPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setVoucherUpdateError('Voucher price must be a positive number');
      return;
    }
    
    setIsUpdatingVoucher(true);
    
    try {
      const response = await updateVoucher({
        voucherId: voucherData._id,
        menuId,
        code: codeNumber,
        voucherPrice: priceNumber
      });
      
      if (response.data?.success) {
        setVoucherUpdateSuccess('Voucher updated successfully!');
        
        // Reset form after successful update
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setVoucherUpdateError('Failed to update voucher. Please try again.');
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      
      if (error.response?.data) {
        const { message } = error.response.data;
        setVoucherUpdateError(message || 'Failed to update voucher');
        
        if (error.response.status === 400) {
          if (message?.includes('Voucher code already exists')) {
            setVoucherUpdateError('This voucher code already exists. Please use a different code.');
          }
        }
      } else {
        setVoucherUpdateError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsUpdatingVoucher(false);
    }
  };

  if (!isOpen || !voucherData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Edit Voucher</h2>
        
        {voucherUpdateError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-100 text-sm">{voucherUpdateError}</p>
          </div>
        )}
        
        {voucherUpdateSuccess && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-100 text-sm">{voucherUpdateSuccess}</p>
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
              disabled={isUpdatingVoucher || isLoadingMenus || !selectedAdmin}
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
              disabled={isUpdatingVoucher}
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
              disabled={isUpdatingVoucher}
              min="0"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="flex justify-between gap-3 mt-6">
          <button 
            onClick={onClose}
            disabled={isUpdatingVoucher}
            className={`px-4 py-2 rounded-lg ${
              isUpdatingVoucher 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdateVoucher}
            disabled={isUpdatingVoucher || !voucherFormData.menuId || !voucherFormData.code || !voucherFormData.voucherPrice}
            className={`px-6 py-2 rounded-lg font-medium ${
              isUpdatingVoucher || !voucherFormData.menuId || !voucherFormData.code || !voucherFormData.voucherPrice
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed'
                : 'bg-[#10b981] text-white hover:bg-[#059669]'
            }`}
          >
            {isUpdatingVoucher ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update Voucher'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVoucherModal;
