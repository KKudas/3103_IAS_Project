# User Routes

This document describes the available API routes for the User Service.

## Github Provider

Access this link register and receive jwt token: https://localhost:8080/users/auth/github

**Response**

```json
{
  "token": "JWT_TOKEN_HERE"
}
```

## Local Provider

1. **POST https&#58;//localhost:8080/users/register**  

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
     "token": "JWT_TOKEN_HERE"
   }
   ```
2. **POST https&#58;//localhost:8080/users/login**  

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
     "token": "JWT_TOKEN_HERE"
   }
   ```

3. **[ADMIN] GET https&#58;//localhost:8080/users/**  

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

   **Request body**

   ```json
   {
     "username": "Doe"
   }
   ```

   **Response**

   ```json
   {
     "message": "User successfully updated"
   }
   ```

6. **[ADMIN, USER] DELETE https&#58;//localhost:8080/users/{id}**  

   **Response**

   ```json
   {
     "message": "User successfully deleted"
   }
   ```
