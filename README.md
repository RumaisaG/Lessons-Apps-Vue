
# After School Lessons Booking Website — Frontend

This is the frontend of my coursework project for the Fullstack module.  
The system allows users to browse lessons, view details, add items to a shopping cart, and complete a checkout without the need to create an account.

## Features

### Home / Lessons Page
- Retrieves and displays all lessons from the backend.
- Each lesson shows its name, price, number of available spaces, and image.
- Users can filter lessons based on:
  - Price (low → high or high → low)
  - Availability ( Weekdays or Weekend )
  - Number of seats left
  - Topic
  - Location
- Users can click on a lesson to view more information and a full image gallery.

### Shopping Cart
- Add lessons to the cart dynamically using JavaScript.
- Cart quantity updates automatically.
- Prevents adding an item if there are no spaces left.
- Updates available spaces on the frontend immediately after adding.

###  Checkout Form
- Checkout form appears on the cart page .
- “Checkout” button is **always visible**, but only enabled when:
  - Name contains letters only
  - Phone number contains digits only
- Validation is done using JavaScript and regular expressions.
- After submitting, a confirmation message is displayed.

### Image Gallery
- Each lesson supports multiple images.
- Main image and thumbnails update interactively.

### API Integration
- Uses `fetch` to:
  - Load lesson data
  - Submit orders via POST
  - Trigger PUT requests that update available lesson spaces after checkout

## Technologies Used
- **Vue.js (CDN version, no SFC)**
- **HTML, CSS, JavaScript**
- **Bootstrap**
- Fully client-side, interacts with backend via REST APIs.

## Project Structure
- index.html
- style.css

## Live Demo Page
You can view the live deployed version of the project on the following link :
https://rumaisag.github.io/Lessons-Apps-Vue/
