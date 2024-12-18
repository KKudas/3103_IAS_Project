## User Service

### Dummy Data

- **Admin**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- **Customer**

```json
{
  "username": "customer",
  "password": "customer123"
}
```

### Authentication Providers

#### GitHub Provider

- **URL:** `https://localhost:8080/users/auth/github`
- **Response:**

```json
{
  "message": "User successfully logged in",
  "token": "JWT_TOKEN_HERE"
}
```

#### Local Provider

1. **Register a User**

   - **[POST]** `https://localhost:8080/users/register`
   - **Request Body:**

     ```json
     {
       "username": "John",
       "email": "JohnDoe@gmail.com",
       "password": "@Password123",
       "role": "customer"
     }
     ```

   - **Response:**

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

2. **Login a User**

   - **[POST]** `https://localhost:8080/users/login`
   - **Request Body:**

     ```json
     {
       "username": "John",
       "password": "@Password123"
     }
     ```

   - **Response:**

     ```json
     {
       "id": 1,
       "message": "User successfully logged in",
       "token": "JWT_TOKEN_HERE"
     }
     ```

3. **Retrieve all users**

   - **[GET] https&#58;//localhost:8080/users/**

   - **Roles Required**: Admin

   - **Response**

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

4. **Retrieve user by ID**

   - **[GET] https&#58;//localhost:8080/users/{id}**

   - **Roles Required**: Admin, Support, User

   - **Response**

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

5. **Update user by ID**

   - **[PUT] https&#58;//localhost:8080/users/{id}**

   - **Roles Required**: Admin, Support, User

   - **Request body**

   ```json
   {
     "username": "Doe"
   }
   ```

   - **Response**

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

6. **Delete user by ID**

   - **[DELETE] https&#58;//localhost:8080/users/{id}**

   - **Roles Required**: Admin, Support, User

   - **Response**

   ```json
   {
     "message": "User successfully deleted"
   }
   ```
