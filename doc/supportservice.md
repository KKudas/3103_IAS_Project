# Support Routes AKA (Customer Support Routes)

This document describes the available API routes for the Customer Support Service.

1. **[ADMIN, CUSTOMER] POST https://localhost:8080/support/tickets**

   **Description**  
    This endpoint allows customers and admins to create a new support ticket. Customers can submit their complaints or feature requests, while admins can also create tickets on behalf of users.

   **Request body**

   ```json
    {
    "title": "Cannot access account",
    "description": "I'm unable to log into my account with my credentials.",
    "priority": "High"
    }
   ```

   **Response**

   ```json
    {
    "message": "Ticket successfully created",
    "ticket": {
        "id": 1,
        "title": "Cannot access account",
        "description": "I'm unable to log into my account with my credentials.",
        "status": "Open",
        "priority": "High",
        "userId": 1
    }
    }
   ```

2. **[ADMIN, CUSTOMER] GET https://localhost:8080/support/tickets**

   **Description**  
    This endpoint retrieves a list of all support tickets. Admins can view all tickets, while customers can only view tickets they have created.

   **Response**

   ```json
    {
        {
            "id": 1,
            "title": "Cannot access account",
            "description": "I'm unable to log into my account with my credentials.",
            "status": "Open",
            "priority": "High",
            "userId": 1
        },
        {
            "id": 2,
            "title": "Error on checkout",
            "description": "Encountered an error while trying to complete my purchase.",
            "status": "In Progress",
            "priority": "Medium",
            "userId": 2
        }
    }
   ```

3. **[ADMIN, CUSTOMER] GET https://localhost:8080/support/tickets/{id}**

   **Description**  
    This endpoint retrieves the details of a specific support ticket by its ID. Admins can access any ticket, while customers can only access their own tickets.

   **Response**

   ```json
    {
    "id": 1,
    "title": "Cannot access account",
    "description": "I'm unable to log into my account with my credentials.",
    "status": "Open",
    "priority": "High",
    "userId": 1
    }
   ```

4. **[ADMIN, CUSTOMER] PUT https://localhost:8080/support/tickets/{id}**

   **Description**  
    This endpoint allows admins and customers to update the details of an existing support ticket by its ID. Customers can update their own tickets, while admins can update any ticket.

   **Request body**

   ```json
    {
        "title": "Cannot access account",
        "description": "I'm still unable to log into my account.",
        "status": "In Progress",
        "priority": "High"
    }
   ```

   **Response**

   ```json
    {
    "message": "Ticket successfully updated",
    "ticket": {
        "id": 1,
        "title": "Cannot access account",
        "description": "I'm still unable to log into my account.",
        "status": "In Progress",
        "priority": "High",
        "userId": 1
        }
    }
   ```

5. **[ADMIN, DELETE] DELETE https://localhost:8080/support/tickets/{od}**

   **Description**  
    This endpoint allows admins and customers to delete a support ticket by its ID. Customers can delete their own tickets, while admins can delete any ticket.

   **Response**

   ```json
    {
    "message": "Ticket successfully deleted"
    }
   ```


**AUTHORIZATION**

All endpoints require a valid JWT token to be included in the Authorization header using the Bearer scheme

**EXAMPLE HEADER**

| Key | Header |
| -- | -- |
| Authroization | Bearer <JWT_TOKEN_HERE> |

JWT Token can be retrieved from logging in.

Alternatively, assuming you are using Postman, you can click the Authorization Tab > Auth Type > Bearer Token > Token > Paste the JWT Token