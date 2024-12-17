# User Routes

This document describes the available API routes for the User Service.  
Dummy data for users has been already created:

- Admin

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- Customer

```json
{
  "username": "customer",
  "password": "customer123"
}
```

## Github Provider

Access this link register and receive jwt token: https://localhost:8080/users/auth/github

**Response**

```json
{
  "message": "User successfully logged in",
  "token": "JWT_TOKEN_HERE"
}
```

## Local Provider

1. **POST https&#58;//localhost:8080/users/register**

   **Description**  
   This endpoint registers a new user with a specified username, email, password, and role. The password will be encrypted before storage.

   **Request body**

   ```json
   {
     "username": "John",
     "email": "JohnDoe@gmail.com",
     "password": "@Password123",
     "role": "customer"
   }
   ```

   **Response**

   ```json
   {
     "message": "User successfully registered",
     "user": {
       "id": 1,
       "github_id": null,
       "username": "John",
       "email": "JohnDoe@gmail.com",
       "password": "ENCRYPTED_PASSWORD",
       "role": "customer"
     }
   }
   ```

2. **POST https&#58;//localhost:8080/users/login**

   **Description**  
   This endpoint logs in a user by verifying their username/email and password. If valid, a JWT token will be returned for subsequent authentication.

   **Request body**

   ```json
   {
     "username": "John",
     "password": "@Password123"
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

3. **[ADMIN] GET https&#58;//localhost:8080/users/**

   **Description**  
   This endpoint retrieves a list of all users in the system. It is only accessible by an admin.

   **Response**

   ```json
   [
     {
       "id": 1,
       "github_id": null,
       "username": "John",
       "email": "JohnDoe@gmail.com",
       "password": "ENCRYPTED_PASSWORD",
       "role": "customer"
     },
     {
       "id": 2,
       "github_id": 123456789,
       "username": "Juan",
       "email": null,
       "password": null,
       "role": "admin"
     }
   ]
   ```

4. **[ADMIN, USER] GET https&#58;//localhost:8080/users/{id}**

   **Description**  
   This endpoint retrieves the details of a specific user by their ID. Both admins and the user themselves can access this endpoint.

   **Response**

   ```json
   {
     "id": 1,
     "github_id": null,
     "username": "John",
     "email": "JohnDoe@gmail.com",
     "password": "ENCRYPTED_PASSWORD",
     "role": "customer"
   }
   ```

5. **[ADMIN, USER] PUT https&#58;//localhost:8080/users/{id}**

   **Description**  
   This endpoint updates the details of an existing user by their ID. The user can modify their own information, and an admin can modify any user's details.

   **Request body**

   ```json
   {
     "username": "Doe"
   }
   ```

   **Response**

   ```json
   {
     "message": "User successfully registered",
     "user": {
       "id": 1,
       "github_id": null,
       "username": "Doe",
       "email": "JohnDoe@gmail.com",
       "password": "ENCRYPTED_PASSWORD",
       "role": "customer"
     }
   }
   ```

6. **[ADMIN, USER] DELETE https&#58;//localhost:8080/users/{id}**

   **Description**  
   This endpoint deletes a user by their ID. Both admins and users can delete their own account, but only admins can delete other users' accounts.

   **Response**

   ```json
   {
     "message": "User successfully deleted"
   }
   ```
