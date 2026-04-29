// controllers/businessController.js
import { where } from 'sequelize';
import Business from '../model/busness.model.js';


export const registerBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, ntn, address, province, fbrToken, posId } = req.body;

   

    const business = await Business.create({
      userId,
      name,
      ntn,
      address,
      province,
      fbrToken,
      posId,
      isActive: true // 👈 add this (important)
    });

    return res.status(201).json({
      message: "Business registered successfully",
      business
    });

  } catch (err) {
    console.error("🔥 FULL ERROR OBJECT:");
    console.error(err); // 👈 full error

    console.error("🔥 ERROR MESSAGE:", err.message);

    if (err.errors) {
      console.error("🔥 VALIDATION ERRORS:");
      err.errors.forEach(e => console.error(e.message));
    }

    return res.status(500).json({
      message: "Failed to create business",
      error: err.message,
      details: err.errors || null
    });
  }
};
// get busness 
export const getBusiness = async (req, res) => {
  try {
    const userId = req.user.id;

    const business = await Business.findOne({
      where: { userId: userId }
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: business
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};