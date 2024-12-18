# 3103 Final Project

Created by:

- Ralph Miguel Mandigma
- Kyle Tubod
- Lyan Ethan Jover

## Project Overview //NOT YET FINAL

This project demonstrates a simple microservice involving three independent microservices:

- **User Service**: Handles user registration, login, and user profile management.
- **Inventory Service**: Inventory desc...
- **Support Service**: Customer Support desc...

## Documentation

This document provides detailed descriptions of the API routes available for the User, Inventory, Order, and Support services.

- [User Service](./doc/userservice.md)
- [Order Service](./doc/orderservice.md)
- [Inventory Service](./doc/inventoryservice.md)
- [Support Service](./doc/supportservice.md)

## Project Setup //NOT YET FINAL

1. Clone the repository

   ```
   git clone https://github.com/KKudas/3103_SIA_Project.git
   ```

2. CD into root folder

   ```
   cd 3103_SIA_Project
   ```

3. Install node dependency

   ```
   npm install
   ```

4. Create MySQL schema

   Before running the services, you need to set up a MySQL schema. Open MySQL Workbench (or your preferred MySQL client) and run the following query:

   ```sql
   CREATE SCHEMA IF NOT EXISTS enterpriseapp;
   ```

   The `enterpriseapp` schema will store the necessary database for your services.

5. Configure the secure-gateway.js file

   In the project folder, navigate to the secure-gateway.js file. Open it and replace the default password with the password used by your system. Find the line where the MySQL password is set and change it accordingly.

6. Run each API on different terminals //Not yet final

   ```
   node secure-gateway.js
   ```

   ```
   node user-service.js
   ```

   ```
   node order-service.js
   ```

   ```
   node inventory-service.js
   ```
