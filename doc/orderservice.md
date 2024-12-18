## Order Service

### Routes

1. **Create a New Order**

   - **[POST]** `https://localhost:8080/orders/add`
   - **Roles Required:** Customer
   - **Request Body:**

     ```json
     {
       "product_id": 1,
       "quantity": 5
     }
     ```

   - **Response:**

     ```json
     {
       "message": "Order successfully placed",
       "data": {
         "id": 1,
         "user_id": 1,
         "product_id": 1,
         "quantity": 5,
         "price": 100.0,
         "total_price": 500.0
       }
     }
     ```

2. **Get All Orders**

   - **[GET]** `https://localhost:8080/orders/all`
   - **Roles Required:** Admin, Support
   - **Response:**

     ```json
     [
       {
         "id": 1,
         "user_id": 1,
         "product_id": 1,
         "quantity": 5,
         "price": 100.0,
         "total_price": 500.0
       },
       {
         "id": 2,
         "user_id": 1,
         "product_id": 2,
         "quantity": 10,
         "price": 100.0,
         "total_price": 1000.0
       }
     ]
     ```

3. **Get All Order Details for a User**

   - **[GET]** `https://localhost:8080/orders`
   - **Roles Required:** Customer, Admin, Support
   - **Response:**

     ```json
     [
       {
         "id": 1,
         "user_id": 1,
         "product_id": 1,
         "quantity": 5,
         "price": 100.0,
         "total_price": 500.0
       },
       {
         "id": 2,
         "user_id": 1,
         "product_id": 2,
         "quantity": 10,
         "price": 100.0,
         "total_price": 1000.0
       }
     ]
     ```

4. **Get Order Details**

   - **[GET]** `https://localhost:4003/orders/{orderId}`
   - **Roles Required:** Customer, Admin, Support
   - **Response:**

   ```json
   {
     "id": 1,
     "user_id": 1,
     "product_id": 1,
     "quantity": 5,
     "price": 100.0,
     "total_price": 500.0
   }
   ```

5. **Update Order Status**

   - **[PUT]** `https://localhost:4003/orders/{orderId}`
   - **Roles Required:** Admin, Support
   - **Note:**
     - Only status can be updated
     - pending, completed, and cancelled are accepted values
   - **Request Body:**

     ```json
     {
       "status": "completed"
     }
     ```

   - **Response:**

     ```json
     {
       "message": "Order status successfully updated",
       "data": {
         "id": 1,
         "status": "completed"
       }
     }
     ```

6. **Delete an Order**

   - **[DELETE]** `https://localhost:4003/orders/{orderId}`
   - **Roles Required:** Admin
   - **Response:**

     ```json
     {
       "message": "Order successfully deleted"
     }
     ```
