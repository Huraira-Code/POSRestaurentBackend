import { FaExclamationTriangle, FaTrash } from "react-icons/fa";

const DeleteVoucherModal = ({
  voucherToDelete,
  handleCancelDeleteVoucher,
  handleDeleteVoucher,
  isDeletingVoucher,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-bold text-[#f5f5f5]">Delete Voucher</h3>
        </div>
        <p className="text-[#a0a0a0] mb-6">
          Are you sure you want to delete voucher code #{voucherToDelete.code}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancelDeleteVoucher}
            disabled={isDeletingVoucher}
            className="px-4 py-2 bg-[#404040] hover:bg-[#505050] text-[#f5f5f5] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteVoucher}
            disabled={isDeletingVoucher}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            {isDeletingVoucher ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVoucherModal