## Inventory Service

### Dummy Data

- **Product A**

  ```json
  {
    "id": 1,
    "name": "Product A",
    "price": 100.0,
    "quantity": 50
  }
  ```

  - **Customer**

  ```json
  {
    "id": 1,
    "name": "Product B",
    "price": 29.99,
    "quantity": 150
  }
  ```

### Routes

1. **Add a New Product**

   - **[POST]** `https://localhost:8080/inventory/add`
   - **Roles Required:** Admin, Manager
   - **Request Body:**

     ```json
     {
       "name": "Product A",
       "price": 100.0,
       "quantity": 50
     }
     ```

   - **Response:**

     ```json
     {
       "message": "Product successfully added",
       "data": {
         "id": 1,
         "name": "Product A",
         "price": 100.0,
         "quantity": 50
       }
     }
     ```

2. **Get All Products**

   - **[GET]** `https://localhost:8080/inventory/`
   - **Response:**

     ```json
     [
       {
         "id": 1,
         "name": "Product A",
         "price": 100.0,
         "quantity": 50
       },
       {
         "id": 2,
         "name": "Product B",
         "price": 50.0,
         "quantity": 100
       }
     ]
     ```

3. **Get Product Details by ID**

   - **[GET]** `https://localhost:8080/inventory/{productId}`
   - **Response:**

     ```json
     {
       "id": 1,
       "name": "Product A",
       "price": 100.0,
       "quantity": 50
     }
     ```

4. **Update a Product**

   - **[PUT]** `https://localhost:8080/inventory/{productId}`
   - **Roles Required:** Admin, Manager, Customer
   - **Request Body:**

     ```json
     {
       "quantity": 30
     }
     ```

   - **Response:**

     ```json
     {
       "message": "Product successfully updated",
       "product": {
         "id": 1,
         "name": "Product A",
         "price": 100.0,
         "quantity": 30
       }
     }
     ```

5. **[DELETE] https&#58;//localhost:8080/inventory/{id}**

   - **Roles Required**: Admin, Manager

   - **Description**  
     This endpoint allows an admin to delete a product by its ID.

   - **Response**

   ```json
   {
     "message": "Product successfully deleted"
   }
   ```
