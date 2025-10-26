import React, { useState, useEffect } from 'react';

const EditCategoryModal = ({ category, onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState(category?.name || '');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updatedCategories, setUpdatedCategories] = useState([]);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setUpdateSuccess('');
      setUpdateError('');
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setUpdateError('');
      setUpdateSuccess('');
      
      // Add to updated categories list immediately
      setUpdatedCategories(prev => [...prev, { 
        originalName: category?.name, 
        newName: name.trim(),
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Show success message
      setUpdateSuccess(`Category "${category?.name}" successfully updated to "${name.trim()}"!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
      
      // Call the parent's onSubmit function
      try {
        onSubmit(name.trim());
      } catch (error) {
        console.error('Error updating category:', error);
        setUpdateError(error.message || 'Failed to update category');
        // Remove from updated list if there was an error
        setUpdatedCategories(prev => prev.slice(0, -1));
        setUpdateSuccess('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-8 rounded-lg w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#f5f5f5] mb-6">Edit Category</h2>
        
        {/* Success/Error Messages */}
        {updateError && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-100 text-sm">{updateError}</p>
          </div>
        )}
        
        {updateSuccess && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
            <p className="text-green-100 text-sm">{updateSuccess}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-[#f5f5f5] text-sm font-medium mb-2">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear errors when user starts typing
                if (updateError) {
                  setUpdateError('');
                }
              }}
              disabled={isLoading}
              className="w-full p-3 bg-[#262626] text-[#f5f5f5] rounded-lg border border-[#404040] focus:border-[#60a5fa] focus:outline-none"
              placeholder="Enter category name"
              autoFocus
              required
            />
          </div>
        </div>
        
        {/* Show updated categories if any */}
        {updatedCategories.length > 0 && (
          <div className="mt-4 p-4 bg-[#262626] rounded-lg">
            <h3 className="text-[#f5f5f5] text-sm font-medium mb-3">
              Updated Categories in this Session ({updatedCategories.length}):
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {updatedCategories.map((update, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#1a1a1a] rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-800 text-blue-200 rounded">
                      {update.originalName}
                    </span>
                    <span className="text-[#a0a0a0]">→</span>
                    <span className="px-2 py-1 bg-green-800 text-green-200 rounded">
                      {update.newName}
                    </span>
                  </div>
                  <span className="text-[#606060]">{update.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading 
                ? 'bg-[#404040] text-[#606060] cursor-not-allowed' 
                : 'bg-[#404040] text-[#f5f5f5] hover:bg-[#505050]'
            }`}
          >
            {updatedCategories.length > 0 ? 'Done' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || name.trim() === category?.name}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading || !name.trim() || name.trim() === category?.name
                ? 'bg-[#3b82f6] opacity-50 cursor-not-allowed text-white'
                : 'bg-[#60a5fa] hover:bg-[#3b82f6] text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : updatedCategories.length > 0 ? (
              'Update Another'
            ) : (
              'Update Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryModal;
