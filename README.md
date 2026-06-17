# Order Tracker - Inventory Dashboard

Welcome! This is a simple, full-stack inventory dashboard built using **React (Vite)** for the frontend and **Node.js/Express** with **SQLite** for the backend. 


## Live Demo
https://shop-inventory-1.onrender.com/

## Admin Credentials
To test the restricted admin dashboard type
 **Email:** `admin@example.com`*
 **Password:** `password`

## How to Test the Application

Please follow these steps to verify all the required functionalities:

### 1. Public User View
* **Requirement:** Public users can view and search products.
* **Test:** Open the site without logging in. You should see the Home page listing all available products. Use the search bar to filter products by name.

### 2. Registered User Checkout
* **Requirement:** Registered users can add products to the basket and checkout using Bank Transfer or Cash on Delivery.
* **Test:** 
  1. Click **Register** in the navigation bar to create a new customer account.
  2. Click **Add to Cart** on a few products.
  3. Navigate to your **Cart**.
  4. Select a payment method (If you select "Bank Transfer", the bank details will appear).
  5. Click **Checkout**.

### 3. User Order History
* **Requirement:** Logged in users can view their previously placed orders.
* **Test:** After checking out, click on **My Orders** in the navigation bar. You will see your order history, total price, and the individual items purchased.

### 4. Admin Dashboard
* **Requirement:** Admin can View/Add/Edit/Delete products.
* **Test:**
  1. Click **Logout**.
  2. Log back in using the Admin credentials (`admin@example.com` / `password`).
  3. Click **Admin Dashboard** in the navigation bar.
  4. Test adding a new product via the form.
  5. Test deleting an existing product. 


