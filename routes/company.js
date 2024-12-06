const express = require("express");
const Company = require("../models/companyModel");
const { authMiddleware } = require("./auth");
const Request = require("../models/requests");
const router = express.Router();

// Créer une entreprise (Utilisateur authentifié)
//peut etre admin ou simple utilisateur
//1 middleware pour vérifier les tokens ensuite passer ala 2éme middleware
router.post("/", authMiddleware(["user", "admin"]), async (req, res) => {
  try {
    const { name, registrationNumber } = req.body;
    const company = new Company({
      name,
      registrationNumber,
      owner: req.user.id,
    });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: "Company creation failed" });
  }
});

// Validation d'une entreprise (Admin seulement)
router.patch("/:id/validate", authMiddleware(["admin"]), async (req, res) => {
  try {
    console.log(req.params.id);
    const company = await Company.findOneAndUpdate(
      { registrationNumber: req.params.id },
      { status: "validated" },
      { new: true }
    );
    console.log(company);
    if (!company) return res.status(404).json({ error: "Company not found" });

    /* company.status = 'validated';
        await company.save(); */

    res.json(company);
  } catch (err) {
    res.status(400).json({ error: "Validation failed" });
  }
});
router.patch("/:id/reject", authMiddleware(["admin"]), async (req, res) => {
    try {
      const company = await Company.findOneAndUpdate(
        { registrationNumber: req.params.id },
        { status: "rejected" },
        { new: true }
      );
      console.log(company);
      if (!company) return res.status(404).json({ error: "Company not found" });
  
      res.json(company);
    } catch (err) {
      res.status(400).json({ error: "Rejection failed" });
    }
  });
router.get("/admin", authMiddleware(["admin"]), async (req, res) => {
  companies = await Company.find(
    {},
    { name: 1, status: 1, registrationNumber: 1, owner: 1, _id: 0 }
  );
  res.send(companies);
});

router.get("/list", authMiddleware(["user"]), async (req, res) => {
  userId = req.user.id;
  const companies = await Company.find(
    { owner: userId },
    { name: 1, status: 1, registrationNumber: 1, _id: 0 }
  );
  console.log(companies, userId);
  res.send(companies);
});

router.get("/:id/delete", authMiddleware(["user"]), async (req, res) => {
  userId = req.user.id;
  companyId = req.params.id;
  try {
    const company = await Company.deleteOne({
      registrationNumber: companyId,
      owner: userId,
    });
    res.status(201).json({ success: "Company deleted successfuly" });
  } catch (err) {
    res.status(400).json({ error: "Company deletion failed" });
  }
});

//add company create,read single one and update
router.get("/:id", authMiddleware(["user"]), async (req, res) => {
  userId = req.user.id;
  companyId = req.params.id;
  try {
    const company = await Company.find({
      registrationNumber: companyId,
      owner: userId,
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: "Company Not Found" });
  }
});
router.put("/update/:id",authMiddleware(["user"]),async (req, res) => {
    const  userId  = req.user.id;
    const companyId = req.params.id;
    const newInfo = req.body;
    
    // Prevent users from updating the 'status' field directly
    if (newInfo.status !== undefined) {
        return res.status(403).json({ error: 'Updating the status field is forbidden.' });
    }

    try {
        // Find the company by ID and ensure the user owns it
        const company = await Company.findOneAndUpdate(
            { registrationNumber: companyId, owner: userId }, // Search condition
            newInfo,                           // Updated data
            { new: true, runValidators: true } // Return updated document and apply schema validation
        );

        if (!company) {
            return res.status(404).json({ error: "Company not found or you do not have permission to update it." });
        }

        res.status(200).json({ message: "Company updated successfully", company });
    } catch (error) {
        res.status(500).json({ error: "Unable to modify the company", details: error.message });
    }

  }
);

module.exports = router;
