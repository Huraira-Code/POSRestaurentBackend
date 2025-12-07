// const Voucher = require('../models/voucherModel');

// // Create Voucher
// const createVoucher = async (req, res, next) => {
//     try {
//         const {code, voucherPrice, applyOnce ,voucherType } = req.body;
//         if ( !code || !voucherPrice) {
//             return res.status(400).json({ success: false, message: "Menu ID, code and Voucher price are required" });
//         }
//         const existingVoucher = await Voucher.findOne({ code });
//         if (existingVoucher) {
//             return res.status(400).json({ success: false, message: "Voucher code already exists" });
//         }
//         const voucher = await Voucher.create({  code, voucherPrice, applyOnce,voucherType });
//         res.status(201).json({ success: true, data: voucher });
//     } catch (error) {
//         next(error);
//     }
// }

// // Update Voucher
// const updateVoucher = async (req, res, next) => {
//     try {
//         const { voucherId, voucherType , code, voucherPrice } = req.body;

//         const voucher = await Voucher.findById(voucherId);

//         if (!voucher) {
//             return res.status(404).json({ success: false, message: "Voucher not found" });
//         }
//         if (voucherType) voucher.voucherType = voucherType;
//         if (voucherPrice) voucher.voucherPrice = voucherPrice;
//         if (code) {
//             const existingVoucher = await Voucher.findOne({ code });
//             if (existingVoucher && existingVoucher._id.toString() !== voucherId) {
//                 return res.status(400).json({ success: false, message: "Voucher code already exists" });
//             }
//             voucher.code = code;
//         }
//         const updatedVoucher = await voucher.save();
//         res.status(200).json({ success: true, data: updatedVoucher });
//     } catch (error) {
//         next(error);
//     }
// }

// // Get All Vouchers
// const getAllVoucher = async (req, res, next) => {
//     try {
//         const vouchers = await Voucher.find().populate('voucherType' ,'name');
//         if (!vouchers || vouchers.length === 0) {
//             return res.status(404).json({ success: false, message: "No vouchers found" });
//         }
//         res.status(200).json({ success: true, data: vouchers });
//     } catch (error) {
//         next(error);
//     }
// }

// // Get Vouchers by Admin ID
// const getVouchersByAdmin = async (req, res, next) => {
//     try {
//         const { adminId } = req.params;

//         if (!adminId) {
//             return res.status(400).json({ success: false, message: "Admin ID is required" });
//         }

//         // First, find all menus for this admin
//         const Menu = require('../models/menuModel');
//         const adminMenus = await Menu.find({ adminId: adminId }).select('_id');
//         const menuIds = adminMenus.map(menu => menu._id);

//         // Then find all vouchers for those menus
//         const vouchers = await Voucher.find({ menuId: { $in: menuIds } })
//             .populate('menuId', 'name adminId');

//         if (!vouchers || vouchers.length === 0) {
//             return res.status(404).json({ success: false, message: "No vouchers found for this admin" });
//         }

//         res.status(200).json({ success: true, data: vouchers });
//     } catch (error) {
//         next(error);
//     }
// }

// // Delete Voucher
// const deleteVoucher = async (req, res, next) => {
//     try {
//         const { voucherId } = req.body;
//         if (!voucherId) {
//             return res.status(400).json({ success: false, message: "Voucher ID is required" });
//         }
//         const voucher = await Voucher.findByIdAndDelete(voucherId);
//         if (!voucher) {
//             return res.status(404).json({ success: false, message: "Voucher not found" });
//         }
//         res.status(200).json({ success: true, message: "Voucher deleted successfully" });
//     } catch (error) {
//         next(error);
//     }
// }

// // Validate Voucher
// const validateVoucher = async (req, res, next) => {
//     try {
//         const { voucherCode, orderTotal, menuIds } = req.body;

//         console.log('Voucher validation request:', {
//             voucherCode,
//             orderTotal,
//             menuIds,
//             userRole: req.user?.role,
//             userId: req.user?.id
//         });

//         if (!voucherCode) {
//             return res.status(400).json({ success: false, message: "Voucher code is required" });
//         }

//         // Find the voucher by code
//         const voucher = await Voucher.findOne({ code: voucherCode.trim() }).populate('menuId', 'name adminId');

//         console.log('Found voucher:', voucher);

//         if (!voucher) {
//             return res.status(404).json({ success: false, message: "Invalid voucher code" });
//         }

//         // Check if voucher is still valid (not used if applyOnce is true)
//         if (voucher.applyOnce === false) {
//             return res.status(400).json({ success: false, message: "This voucher has already been used" });
//         }

//         // If menuIds are provided, check if the voucher is applicable to any of the menus in the order
//         if (menuIds && menuIds.length > 0) {
//             const isApplicable = menuIds.includes(voucher.menuId._id.toString());
//             console.log('Voucher applicability check:', {
//                 voucherMenuId: voucher.menuId._id.toString(),
//                 orderMenuIds: menuIds,
//                 isApplicable
//             });

//             if (!isApplicable) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `This voucher is only valid for ${voucher.menuId.name}`
//                 });
//             }
//         }

//         // Voucher is valid, return the discount amount
//         const discount = voucher.voucherPrice || 0;

//         console.log('Voucher validation successful:', {
//             voucherId: voucher._id,
//             discount: discount
//         });

//         res.status(200).json({
//             success: true,
//             message: "Voucher is valid",
//             voucher: {
//                 _id: voucher._id,
//                 code: voucher.code,
//                 voucherPrice: voucher.voucherPrice,
//                 menuId: voucher.menuId._id,
//                 menuName: voucher.menuId.name,
//                 applyOnce: voucher.applyOnce
//             },
//             discount: discount
//         });
//     } catch (error) {
//         console.error('Voucher validation error:', error);
//         next(error);
//     }
// }

// module.exports = {
//     createVoucher,
//     updateVoucher,
//     getAllVoucher,
//     getVouchersByAdmin,
//     deleteVoucher,
//     validateVoucher
// };

const Voucher = require("../models/voucherModel");

// Create Voucher
const createVoucher = async (req, res, next) => {
  try {
    const {
      AdminId,
      code,
      voucherPrice,
      voucherType,
      isCapped,
      capAmount,
      itemIds,
    } = req.body;

    if (!AdminId || !code || !voucherPrice) {
      return res.status(400).json({
        success: false,
        message: "AdminId, code and voucherPrice are required",
      });
    }

    const existing = await Voucher.findOne({ code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Voucher code already exists",
      });
    }
    const voucher = await Voucher.create({
      AdminId,
      code,
      voucherPrice,
      voucherType,
      isCapped,
      capAmount: isCapped ? capAmount : null,
      itemIds,
    });

    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

// Update Voucher
const updateVoucher = async (req, res, next) => {
  try {
    const { voucherId, AdminId, code, voucherPrice, voucherType, applyOnce } =
      req.body;

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    // Update code (check unique)
    if (code) {
      const existing = await Voucher.findOne({ code });
      if (existing && existing._id.toString() !== voucherId) {
        return res
          .status(400)
          .json({ success: false, message: "Voucher code already exists" });
      }
      voucher.code = code;
    }

    if (AdminId) voucher.AdminId = AdminId;
    if (voucherPrice !== undefined) voucher.voucherPrice = voucherPrice;
    if (voucherType) voucher.voucherType = voucherType;
    if (applyOnce !== undefined) voucher.applyOnce = applyOnce;

    const updated = await voucher.save();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Get All Vouchers
const getAllVoucher = async (req, res, next) => {
  try {
    const vouchers = await Voucher.find().populate("AdminId", "name email");
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

// Get Vouchers By Admin
const getVouchersByAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    if (!adminId) {
      return res
        .status(400)
        .json({ success: false, message: "Admin ID is required" });
    }

    const vouchers = await Voucher.find({ AdminId: adminId });

    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

// Delete Voucher
const deleteVoucher = async (req, res, next) => {
  try {
    const { voucherId } = req.body;

    if (!voucherId) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher ID is required" });
    }

    const voucher = await Voucher.findByIdAndDelete(voucherId);

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Voucher deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Validate Voucher
const validateVoucher = async (req, res, next) => {
  try {
    const { voucherCode, items, adminId } = req.body;

    if (!voucherCode) {
      return res
        .status(400)
        .json({ success: false, message: "Voucher code is required" });
    }

    if (!adminId) {
      return res
        .status(400)
        .json({ success: false, message: "AdminId is required" });
    }

    if (!items || !Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Items array is required" });
    }

    const voucher = await Voucher.findOne({
      code: voucherCode.trim(),
      AdminId: adminId,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Invalid voucher or not available for this admin",
      });
    }

    // Check applyOnce
    if (voucher.applyOnce === false) {
      return res.status(400).json({
        success: false,
        message: "This voucher has already been used",
      });
    }

    let totalDiscount = 0;
    let updatedItems = [];

    for (let item of items) {
      let itemTotal =
        item.itemTotalAfterDiscount || item.totalPrice || item.price;
      let itemDiscount = 0;

      // CHECK IF ITEM IS ALLOWED BY VOUCHER
      const isItemApplicable = voucher.itemIds?.includes(item.itemId);

      if (isItemApplicable) {
        if (voucher.voucherType === "PERCENTAGE") {
          // Apply percentage
          itemDiscount = (itemTotal * voucher.voucherPrice) / 100;
        } else if (voucher.voucherType === "FIXED") {
          // Fixed discount — only subtract from this item
          itemDiscount = voucher.voucherPrice;
          if (itemDiscount > itemTotal) itemDiscount = itemTotal;
        }
      }

      totalDiscount += itemDiscount;

      updatedItems.push({
        ...item,
        itemDiscount,
        itemTotalAfterDiscount: itemTotal - itemDiscount,
      });
    }

    if (voucher.capAmount && totalDiscount > voucher.capAmount) {
      totalDiscount = voucher.capAmount;
    }

    return res.status(200).json({
      success: true,
      message: "Voucher applied successfully",
      discount: totalDiscount,
      updatedItems,
      voucher: {
        _id: voucher._id,
        AdminId: voucher.AdminId,
        code: voucher.code,
        voucherPrice: voucher.voucherPrice,
        voucherType: voucher.voucherType,
        applyOnce: voucher.applyOnce,
        itemIds: voucher.itemIds,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVoucher,
  updateVoucher,
  getAllVoucher,
  getVouchersByAdmin,
  deleteVoucher,
  validateVoucher,
};
