const inventory = require('./models/inventory.js');

console.log('All Inventory:');
console.log(inventory.getInventory());

console.log('\nAdding Inventory:');
console.log(inventory.addInventory(2, 75));

console.log('\nUpdating Inventory:');
console.log(inventory.updateInventory(2, 150));

console.log('\nGet Inventory by Product ID:');
console.log(inventory.getInventoryByProductId(2));

console.log('\nDeleting Inventory:');
console.log(inventory.deleteInventory(2));

console.log('\nInventory after Deletion:');
console.log(inventory.getInventory());
