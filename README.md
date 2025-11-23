
# Ru Academy - A Lessons Booking Website For Students (FRONTEND)

Ru Academy is a website where students can explore a variety of after-school activities ,view detailed information about the activities, add them to a shopping cart, search for specific activities, and complete checkout — all without needing to create an account. 

The Frontend of the website was deployed through Github Pages on the following link :
https://rumaisag.github.io/Lessons-Apps-Vue/

The Backend for the website was deployed on Render.com via the following link :
https://express-lessons-api.onrender.com/

## Features of the Website

### Home Page
- Retrieves and displays all lessons from the backend.
- Each lesson shows its name, price, number of available spaces, ratings, location, category and image.
- Users can click on a lesson to view more information and a full image gallery.
- Users can even search for a specific lessons with the search as you type functionality.

### Lesson Page
Users can filter lessons based on:
  - Price range
  - Availability ( Weekdays or Weekend )
  - Number of seats left
  - Category/Genre
  - Location
Users can also sort through the lessons based on:
  - Topic (Ascending and Descending)
  - Price (low → high or high → low)
  - Ratings (Highest rated)

### Shopping Cart
- The shopping cart button is enabled only when there is at least 1 lesson in it.
- Lessons can be added in the cart automatically by clicking on the "Enroll Now" button.
- If the lessson's spaces is 0, the "Enroll Now" button is disabled and "No Seats Left" is instead displayed.
- Users can view all their lessons in the cart section.
- Users can increase, decrease or even removed lessons from the cart 
- The cart count is then automatically updated on the UI.

### Checkout Form
- Checkout form appears on the cart page, where user needs to enter a valid fullname, email address and phone number.
- “Checkout” button is **always visible**, but only enabled when:
  - Name contains letters only.
  - Phone number contains only 8 digits.
  - Email Address should follow a defined format.
- Validation is done using regular expressions, and appropriate validation messages are displayed whenever the user wrongly enters the fields.
- After submitting, a confirmation message is displayed to inform the user that their order has been submitted successfully.
- Upon clicking on the "Done" button, users will be redirected to the home page

### API Integration
- Uses `fetch` to:
  - Load lesson data from MongoDB Database ->  `GET` | `/api/lessons` | Fetch all available lessons
  - Submit orders via POST and save in MongoDB database -> | `POST` | `/api/orders` | Create new orders 
  - Trigger PUT requests that update available lesson spaces after checkout -> | `PUT` | `/api/lessons/{id}` | Update lesson availability 
  - Searches for specific lessons in the database -> | `GET` | `/api/search?q={query}` | Search lessons by keyword 

## Technologies Used
- **Vue.js(VUE2) (CDN version, no SFC)**
- **HTML, CSS, JavaScript**
- **Bootstrap**

## Project Structure
- index.html
- style.css
- app.js





