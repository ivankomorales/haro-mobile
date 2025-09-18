const Customer = require("../models/Customer");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

//
// HELPER: FIND OR CREATE CUSTOMER
//
// Used during order creation.
// If no email or social media is found, creates a new customer by name.
// TODO: Improve deduplication logic. In the future, enforce at least one unique identifier.
const findOrCreateCustomer = async (customerData, req) => {
  if (!customerData || !customerData.name) {
    throw new ApiError("Customer name is required", 400);
  }

  let customer = null;

  // Try by email
  if (customerData.email) {
    customer = await Customer.findOne({ email: customerData.email });
  }

  // Try by Instagram
  if (!customer && customerData.socialMedia?.instagram) {
    customer = await Customer.findOne({
      "socialMedia.instagram": customerData.socialMedia.instagram,
    });
  }

  // Try by name (+ optional lastName)
  if (!customer && customerData.name) {
    customer = await Customer.findOne({
      name: customerData.name,
      ...(customerData.lastName && { lastName: customerData.lastName }),
    });
  }

  // If not found, create new
  if (!customer) {
    customer = new Customer(customerData);
    await customer.save();

    await logEvent({
      event: "customer_created",
      objectId: customer._id,
      description: `Customer created via order (name only)`,
      req,
    });
  }

  return customer;
}; // end findOrCreateCustomer

// ---------------------------------------------
// 🟢 GET ALL CUSTOMERS (GET /api/customers)
// ---------------------------------------------
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort("name");
    res.json(customers);
  } catch (err) {
    next(err);
  }
}; // end getCustomers

// ---------------------------------------------
// 🟢 GET CUSTOMER BY ID (GET /api/customers/:id)
// ---------------------------------------------
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }
    res.json(customer);
  } catch (err) {
    next(err);
  }
}; // end getCustomerById

// ---------------------------------------------
// 🔵 UPDATE CUSTOMER (PUT /api/customers/:id)
// ---------------------------------------------
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    if (!customer.socialMedia) {
      customer.socialMedia = {};
    }

    const changes = [];

    // Update top-level fields
    ["name", "email", "phone", "notes"].forEach((field) => {
      if (req.body[field]?.trim() && req.body[field] !== customer[field]) {
        changes.push(`${field}: ${customer[field]} → ${req.body[field]}`);
        customer[field] = req.body[field];
      }
    });

    // Update social media
    if (req.body.socialMedia) {
      const platforms = ["instagram", "facebook", "tiktok"];
      platforms.forEach((platform) => {
        const newValue = req.body.socialMedia[platform]?.trim();
        const oldValue = customer.socialMedia?.[platform];

        if (newValue && newValue !== oldValue) {
          changes.push(
            `socialMedia.${platform}: ${oldValue || "null"} → ${newValue}`
          );
          customer.socialMedia[platform] = newValue;
        }
      });
    }

    await customer.save();

    // Log changes
    if (changes.length > 0) {
      await logEvent({
        event: "customer_updated",
        objectId: customer._id,
        description: `Customer updated: ${changes.join(", ")}`,
        req,
      });
    }

    res.json({ message: "Customer updated" });
  } catch (err) {
    next(err);
  }
}; // end updateCustomer

// ---------------------------------------------
// 🔴 DELETE CUSTOMER (DELETE /api/customers/:id)
// ---------------------------------------------
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ApiError("Customer not found", 404));
    }

    await customer.deleteOne();

    await logEvent({
      event: "customer_deleted",
      objectId: customer._id,
      description: `Customer ${customer.email} deleted`,
      req,
    });

    res.json({ message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
}; // end deleteCustomer

// ---------------------------------------------
// 📦 EXPORT CONTROLLER METHODS
// ---------------------------------------------
module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  findOrCreateCustomer, // for external use (orders)
};
