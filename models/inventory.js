const productService = require('../product-service'); // Adjust path if necessary

// Mock inventory data
let inventory = [
  { productId: 1, quantity: 100 },
  { productId: 2, quantity: 50 },
  { productId: 3, quantity: 200 },
];

// Get all inventory items
const getInventory = () => {
  return inventory.map((item) => {
    const product = productService.getProductById(item.productId); // Get product details
    return {
      ...item,
      productDetails: product || { name: 'Product not found', price: 0 },
    };
  });
};

// Get inventory by Product ID
const getInventoryByProductId = (productId) => {
  const item = inventory.find((inv) => inv.productId === productId);
  if (item) {
    const product = productService.getProductById(productId);
    return {
      ...item,
      productDetails: product || { name: 'Product not found', price: 0 },
    };
  }
  return null;
};

// Add inventory item
const addInventory = (productId, quantity) => {
  const product = productService.getProductById(productId);
  if (!product) {
    return { error: 'Product not found. Cannot add inventory.' };
  }
  inventory.push({ productId, quantity });
  return { message: 'Inventory added successfully', productId, quantity };
};

// Update inventory
const updateInventory = (productId, newQuantity) => {
  const index = inventory.findIndex((inv) => inv.productId === productId);
  if (index !== -1) {
    inventory[index].quantity = newQuantity;
    return { message: 'Inventory updated successfully', productId, newQuantity };
  }
  return { error: 'Inventory item not found.' };
};

// Delete inventory item
const deleteInventory = (productId) => {
  const index = inventory.findIndex((inv) => inv.productId === productId);
  if (index !== -1) {
    inventory.splice(index, 1);
    return { message: 'Inventory item removed successfully', productId };
  }
  return { error: 'Inventory item not found.' };
};

module.exports = {
  getInventory,
  getInventoryByProductId,
  addInventory,
  updateInventory,
  deleteInventory,
};
