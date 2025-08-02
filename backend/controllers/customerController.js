const Customer = require("../models/Customer");
const ApiError = require("../utils/ApiError");
const { logEvent } = require("../utils/audit");

// TODO: Improve customer deduplication logic
// Current version allows creating customers with only a name.
// Future versions should enforce at least one unique identifier: email, Instagram, or phone.
const findOrCreateCustomer = async (customerData, req) => {
  if (!customerData || !customerData.name) {
    throw new ApiError("Customer name is required", 400);
  }

  let customer = null;

  if (customerData.email) {
    customer = await Customer.findOne({ email: customerData.email });
  }

  if (!customer && customerData.socialMedia?.instagram) {
    customer = await Customer.findOne({
      "socialMedia.instagram": customerData.socialMedia.instagram,
    });
  }

  if (!customer && customerData.name) {
    customer = await Customer.findOne({
      name: customerData.name,
      ...(customerData.lastName && { lastName: customerData.lastName }),
    });
  }

  // Si no hay email ni instagram, simplemente crea uno nuevo
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
};

// GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort("name");
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/:id
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
};

// PUT /api/customers/:id
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

    ["name", "email", "phone", "notes"].forEach((field) => {
      if (req.body[field]?.trim() && req.body[field] !== customer[field]) {
        changes.push(`${field}: ${customer[field]} → ${req.body[field]}`);
        customer[field] = req.body[field];
      }
    });

    if (req.body.socialMedia) {
      const platforms = ["instagram", "facebook", "tiktok"];
      platforms.forEach((platform) => {
        if (
          req.body.socialMedia[platform]?.trim() &&
          req.body.socialMedia[platform] !== customer.socialMedia?.[platform]
        ) {
          changes.push(
            `socialMedia.${platform}: ${
              customer.socialMedia?.[platform] || "null"
            } → ${req.body.socialMedia[platform]}`
          );
          customer.socialMedia[platform] = req.body.socialMedia[platform];
        }
      });
    }

    await customer.save();

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

// DELETE /api/customers/:id (soft delete in future?)
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
};

module.exports = {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  findOrCreateCustomer, // for external use
};
