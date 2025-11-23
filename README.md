
# Ru Academy - An After-School Lessons Booking Website (FRONTEND)

This is the frontend of my coursework project for the Fullstack module.  

Ru Academy is a website where students can explore a variety of lessons, view detailed information, add lessons to a shopping cart, search for specific activities, and complete checkout — all without needing to create an account. 

The Frontend of the website was deployed through Github Pages on the following link :
https://rumaisag.github.io/Lessons-Apps-Vue/

## Features

### Home / Lessons Page
- Retrieves and displays all lessons from the backend.
- Each lesson shows its name, price, number of available spaces, ratings, location, category and image.
- Users can filter lessons based on:
  - Price (low → high or high → low)
  - Availability ( Weekdays or Weekend )
  - Number of seats left
  - Topic
  - Location
- Users can click on a lesson to view more information and a full image gallery.
- Users can even search for a specific lessons with the search as you type functionality.

### Image Gallery
- Each lesson supports multiple images, where users can have a look at the different lessons available.
- Main image and thumbnails update interactively.

### Shopping Cart
- Add lessons to the cart dynamically using JavaScript.
- Cart quantity updates automatically.
- Lesson can be updated and removed on the cart page also.
- Prevents adding an item if there are no spaces left.
- Updates available spaces on the frontend immediately after adding.

###  Checkout Form
- Checkout form appears on the cart page.
- “Checkout” button is **always visible**, but only enabled when:
  - Name contains letters only
  - Phone number contains digits only
- Validation is done using JavaScript and regular expressions.
- After submitting, a confirmation message is displayed to inform the user that their order has been submitted successfully.

### API Integration
- Uses `fetch` to:
  - Load lesson data from MongoDB Database
  - Submit orders via POST and save in MongoDB database
  - Trigger PUT requests that update available lesson spaces after checkout

## Technologies Used
- **Vue.js(VUE2) (CDN version, no SFC)**
- **HTML, CSS, JavaScript**
- **Bootstrap**
- Fully client-side, interacts with backend via REST APIs.

## Project Structure
- index.html
- style.css
- app.js

