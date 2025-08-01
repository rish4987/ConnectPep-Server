const express = require('express');
const userAuth = require('../middlewares/auth');
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
   
    const user = req.user;

    // Optional: include only public fields
    res.status(200).json({
      message: "Profile fetched successfully.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photoUrl: user.photoUrl,
        age: user.age }}
    );

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { firstName, lastName, photoUrl, gender, age, about, skills } = req.body;

        // object with only the fields that were provided
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (photoUrl) updateFields.photoUrl = photoUrl;
        if (gender) updateFields.gender = gender;
        if (age) updateFields.age = age;
        if (about) updateFields.about = about;
        if (skills) updateFields.skills = skills;

        //Validate that at least one field is being updated
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No update information provided." });
        }

        // Apply the updates to the user object
        Object.assign(user, updateFields);

        await user.save();
        
        res.status(200).json({ message: "Profile updated successfully.", user });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

profileRouter.patch("/profile/changePassword", userAuth, async(req,res)=>{
    try{
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordHash;

        await user.save();
        
        res.status(200).json({ message: "Password changed successfully." });
        
    }
    catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Internal server error." });
    }

})

module.exports = profileRouter;