# Inventory Routes

This document describes the available API routes for the Inventory Service.

1. **[ADMIN] POST https&#58;//localhost:8080/inventory/add**

   **Description**  
    This endpoint allows an admin to add a new product to the inventory with the specified name, price, and quantity.

   **Request body**

   ```json
   {
     "name": "Product A",
     "price": 19.99,
     "quantity": 100
   }
   ```

   **Response**

   ```json
   {
     "message": "Product successfully added",
     "data": {
       "id": 1,
       "name": "Product A",
       "price": 19.99,
       "quantity": 100
     }
   }
   ```

2. **[] GET https&#58;//localhost:8080/inventory**

   **Description**  
    This endpoint retrieves a list of all products in the inventory. Accessible by admins and managers.

   **Response**

   ```json
   [
     {
       "id": 1,
       "name": "Product A",
       "price": 19.99,
       "quantity": 100
     },
     {
       "id": 2,
       "name": "Product B",
       "price": 29.99,
       "quantity": 50
     }
   ]
   ```

3. **[] GET https&#58;//localhost:8080/inventory/{id}**

   **Description**  
    This endpoint retrieves the details of a specific product by its ID.

   **Request body**

   ```json
   {
     "id": 1,
     "name": "Product A",
     "price": 19.99,
     "quantity": 100
   }
   ```

   **Response**

   ```json
   {
     "id": 1,
     "message": "User successfully logged in",
     "token": "JWT_TOKEN_HERE"
   }
   ```

4. **[] PUT https&#58;//localhost:8080/inventory/{id}**

   **Description**  
    This endpoint allows an admin to update the details of a product by its ID. The product's name, price, and quantity can be modified.

   **Request body**

   ```json
   {
     "name": "Updated Product A",
     "price": 24.99,
     "quantity": 150
   }
   ```

   **Response**

   ```json
   {
     "message": "Product successfully updated",
     "product": {
       "id": 1,
       "name": "Updated Product A",
       "price": 24.99,
       "quantity": 150
     }
   }
   ```

5. **[] DELETE https&#58;//localhost:8080/inventory/{id}**

   **Description**  
    This endpoint allows an admin to delete a product by its ID.

   **Response**

   ```json
   {
     "message": "Product successfully deleted"
   }
   ```
