# 3103 Final Project

Created by:

- Ralph Miguel Mandigma
- Kyle Tubod
- Lyan Ethan Jover

## Project Overview

This project designs, implements, and secures an integrated platform for a simulated enterprise environment, enabling secure data sharing between a CRM system, an inventory management system, and a customer support application. The platform follows best practices for systems integration, secure data flow, and architectural robustness, using microservices to support the enterprise’s operational needs.

### Key Features

- **Message Queue (Redis):** Enables asynchronous communication between services, ensuring efficient data flow and system scalability.
- **Logger (Winston):** Provides structured logging for effective monitoring, error tracking, and system auditing across services.
- **JWT Authorization:** Secures data exchanges by validating user tokens, ensuring only authorized access to system resources.
- **Rate Limiter:** Prevents service overload and abuse by restricting request frequency.
- **Sanitation (Express Validator):** Ensures input data is validated and sanitized, protecting the platform from malicious data and vulnerabilities.
- **Database (Sequelize):** Uses Sequelize ORM to interact with relational databases, providing efficient data management and schema migrations.

## Documentation

This document provides detailed descriptions of the API routes available for the User, Inventory, Order, and Support services.

- [User Service](./doc/userservice.md)
- [Order Service](./doc/orderservice.md)
- [Inventory Service](./doc/inventoryservice.md)
- [Support Service](./doc/supportservice.md)

## Project Setup

1. Clone the repository

   ```
   git clone https://github.com/KKudas/3103_SIA_Project.git
   ```

2. Navigate to the project directory

   ```
   cd 3103_SIA_Project
   ```

3. Place the .env file from the drive folder provided

4. Install Node.js dependencies

   ```
   npm install
   ```

5. Set up the MySQL schema

   Before running the services, you need to set up a MySQL schema. Open MySQL Workbench (or your preferred MySQL client) and run the following query:

   ```sql
   CREATE SCHEMA IF NOT EXISTS enterpriseapp;
   ```

   The `enterpriseapp` schema will store the necessary database for your services.

7. Configure the secure-gateway.js file

   In the project folder, navigate to the secure-gateway.js file. Open it and replace the default password with the password used by your system. Find the line where the MySQL password is set and change it accordingly.

8. Start the Docker containers

   ```
   cd logs
   ```
   ```
   docker-compose up -d
   ```

9. Return to root folder run each APIs on different terminals

   ```
   node secure-gateway.js
   ```

   ```
   node user-service.js
   ```

   ```
   node inventory-service.js
   ```

   ```
   node order-service.js
   ```

   ```
   node customer-support-service.js
   ```
