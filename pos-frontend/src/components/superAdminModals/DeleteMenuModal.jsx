import { FaExclamationTriangle } from "react-icons/fa";


const DeleteMenuModal = ({
  setShowDeleteMenuModal,
  setMenuToDelete,
  menuToDelete,
  handleDeleteMenu,
  isDeletingMenu,
  selectedAdmin
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#404040] p-6 max-w-md w-full mx-4 shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900 flex items-center justify-center">
          <FaExclamationTriangle className="text-red-300 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">
            Delete Menu
          </h3>
          <p className="text-[#a0a0a0] text-sm leading-relaxed">
            Are you sure you want to delete the menu "
            <span className="text-[#f5f5f5] font-medium">
              {menuToDelete?.name}
            </span>
            "? This action cannot be undone and will remove the entire menu.
          </p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            setShowDeleteMenuModal(false);
            setMenuToDelete(null);
          }}
          disabled={isDeletingMenu}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isDeletingMenu
              ? "bg-[#404040] text-[#606060] cursor-not-allowed"
              : "bg-[#404040] hover:bg-[#505050] text-[#f5f5f5]"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={() => handleDeleteMenu(selectedAdmin._id, menuToDelete._id)}
          disabled={isDeletingMenu}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            isDeletingMenu
              ? "bg-[#dc2626] opacity-50 cursor-not-allowed text-white"
              : "bg-red-900 hover:bg-red-800 text-red-100"
          }`}
        >
          {isDeletingMenu ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Deleting...
            </div>
          ) : (
            "Delete Menu"
          )}
        </button>
      </div>
    </div>
  </div>
);
export default DeleteMenuModal;
