let lessonApp = new Vue({
    el: '#app',
    data: {
        //imageServerBaseUrl:"http://localhost:3000/images/",
       //serverBaseUrl: "http://localhost:3000/",

        serverBaseUrl: "https://express-lessons-api.onrender.com/",
        imageServerBaseUrl : "https://express-lessons-api.onrender.com/images/",
        
        currentPage: 'home',
        isDarkMode: false,

        // to store the different after school activities
        Activities: [],
        activityImages: [],
        // to store which lesson user has clicked on        
        selectedActivity: null,
        
        searchQuery: '',
        // to store dropdown results when searching
        searchResults:[],
        showSearchDropdown: false,
        searching : false,
        searchTimeout: null,
        // to store lesson based on the search query
        fullSearchResults: [],
        showSearchResults: false,
                

        selectedCategory: 'all',
        sortBy: 'featured',

        // stores current slide for the slideshow
        currentSlide: 0,
        selectedImage: '',        
                
        // different filters options
        filters: {
            categories: [],
            locations: [],
            minPrice: 0,
            maxPrice: 300,
            availability: 'all',
            minSpaces:0,
            selectedDays:'All Days'                
        },                
              
        categories: [
            { value: 'Sports & Games', label: 'Sports & Games' },
            { value: 'Music', label: 'Music' },
            { value: 'Art & Craft', label: 'Art & Craft' },
            { value: 'STEM', label: 'STEM' },
            { value: 'Languages', label: 'Languages' },
        ],
        days: [
            {value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday'], label: 'Weekdays'},
            {value: ['Saturday', 'Sunday'], label: 'Weekends'},
            {value: [], label:'All Days'}
        ],
        locations: ['Port-Louis', 'Curepipe', 'Quatre Bornes', 'Rose-Hill', 'Vacoas'],

        cartItems: 0,
        // to store the user's cart items
        cart: [],
        // to store user's checkout details
        checkout: {name: '',email: '',phone: ''},


        isLoading: false,
        loadingText: 'Processing your order...',
        // for showing the order confirmation box 
        showConfirmation: false,
        orderConfirmation: {name: '',phone: '',total: 0,email: ''},

        // for checking whether the input fields pass the validation checks
        nameValid: true,
        phoneValid: true,
        emailValid: true,

        // to store the validation messages for the different input fields
        validationMessages: {name: '',phone: '',email: ''},
    },
                 
    created()  { 
        this.fetchActivities();
    },

    computed: {
        displayActivities() {
            // show the search results
            if (this.showSearchResults && this.fullSearchResults.length > 0) {
                return this.fullSearchResults; 
            }
                // to show all activities
                return this.Activities;        
        },
              
        filteredActivities() {
            let activities = [...this.displayActivities];
                    
            if (this.filters.categories.length > 0) {
                activities = activities.filter(a => this.filters.categories.includes(a.category));
            }      
            if (this.filters.locations.length > 0) {
                activities = activities.filter(a => this.filters.locations.includes(a.location));
            }
            activities = activities.filter( a => {
                return a.spaces >= this.filters.minSpaces;
            })       
            activities = activities.filter(a => {
                return a.price >= this.filters.minPrice && a.price <= this.filters.maxPrice;
            });

            if (this.filters.selectedDays && this.filters.selectedDays !== 'All Days') {
                activities = activities.filter(activity => {
                    const selectedOption = this.days.find(option => option.label === this.filters.selectedDays);
                    // we check if the lesson has at least one matching day
                    return activity.days.some(day => selectedOption.value.includes(day));
                });
            }
            return activities;
        },
        // function to sort lessons based on their price and ratings      
        sortedActivities() {
            let activities = [...this.filteredActivities];
                    
            switch(this.sortBy) {
                case 'name-asc':
                    return activities.sort((a, b) => a.topic.localeCompare(b.topic));
                case 'name-desc':
                    return activities.sort((a, b) => b.topic.localeCompare(a.topic));
                case 'price-asc':
                    return activities.sort((a, b) => a.price - b.price);
                case 'price-desc':
                    return activities.sort((a, b) => b.price - a.price);
                case 'rating':
                    return activities.sort((a, b) => b.rating - a.rating);
                case 'popular':
                    return activities.sort((a, b) => b.reviews - a.reviews);
                default:
                    return activities;
            }
        },
        // function to calculate the cart subtotal
       cartSubtotal() {
            let total = 0;
            for (const item of this.cart) {
                total += item.price * item.quantity;
            }
            return total;
        },
                    
        serviceFee() {
            return this.cartSubtotal * 0.05;
        },
                
        cartTotal() {
            return this.cartSubtotal + this.serviceFee;
        },
        // function to verify whether checkout can do done based on validation of checkout form
        isCheckoutValid() {
            const fieldsFilled = this.checkout.name.length > 0 && this.checkout.email.length > 0 &&  this.checkout.phone.length > 0;
            return fieldsFilled && this.nameValid && this.emailValid && this.phoneValid;
        }      
    },
            
    methods: {
        // to fetch all the lessons from the backend
        fetchActivities() {
            return fetch(`${this.serverBaseUrl}api/lessons`)
                .then(response => response.json())
                .then(data => {
                    this.Activities = data;
                    console.log('fetched activities with IDs:', data.map(a => ({ topic: a.topic, _id: a._id })));
                })
                .catch(error => {
                    console.error("there has been an error fetching activities:", error);
                });
        },
        // for the category filter on the home page
        filterByCategory(category) {
            this.selectedCategory = category;
            if (category === 'all') {
                this.filters.categories = [];
            } else {
                this.filters.categories = [category];
            }
                this.currentPage = 'activities';
        },
        // to clear all filters                 
        resetFilters() {
            this.filters = {
                categories: [],
                locations: [],
                minPrice: 0,
                maxPrice: 300,
                availability: 'all',
                minSpaces:0,
                selectedDays:'All Days'                
            };
        },
        
        onSearchInput() {
            // checking whether user has typed anything
            if (this.searchQuery.length === 0) {
                this.hideSearchDropdown();
                this.clearSearchResults(); 
                return;
            }
            // clear the previour timeout so that to prevent multiple quick searches
            clearTimeout(this.searchTimeout);
            this.searching = true;
            this.showSearchDropdown = true;

            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        },
        //search as you type function to fetch the searched lessons for the dropdown list
        performSearch() {
            if (this.searchQuery.trim() === '') {
                this.hideSearchDropdown();
                return;
            }
                
            fetch(`${this.serverBaseUrl}api/search?q=${encodeURIComponent(this.searchQuery)}`)
                .then(response => response.json())
                .then(activity => {
                    this.searchResults = activity ;
                    this.searching = false;
                    this.showSearchDropdown = true;
                })
                .catch(error => {
                    console.error('Search error:', error);
                    this.searchResults = [];
                    this.searching = false;
                });
        },
        // when user clicks on enter on the search bar, it fetches all the related lessons
        performFullSearch() {
            if (this.searchQuery.trim() === '') {
                return;
            }

            this.hideSearchDropdown();
            this.currentPage = 'activities';
    
            this.searching = true;
            this.showSearchResults = true;
                
            fetch(`${this.serverBaseUrl}api/search?q=${encodeURIComponent(this.searchQuery)}`)
                .then(response => response.json())
                .then(data => {
                    this.fullSearchResults = data || [];
                    this.searching = false;
                })
                .catch(error => {
                    console.error(' Search error:', error);
                    this.fullSearchResults = [];
                    this.searching = false;
            });
        },
        // to reset all the search related states
        hideSearchDropdown() {
            this.showSearchDropdown = false;
            this.searchResults = [];
            this.searching = false;

            if (this.searchQuery.length === 0) {
                this.fullSearchResults = [];
                this.showSearchResults = false;
            }
        },

        // when user clicks on a search result, it displays the lesson
        onSearchResultClick(activity) {
            this.viewActivity(activity);
            this.searchQuery = '';
            this.hideSearchDropdown();
        },

        // when user clicks somewhere else, hide the search dropdown
        onSearchBlur() {
            setTimeout(() => {
                this.hideSearchDropdown();
            }, 200);
        },
        //show the dropdown when user clicks on the search bar
        onSearchFocus() {
            if (this.searchQuery && this.searchResults.length > 0) {
                this.showSearchDropdown = true;
            }
        },

        // function to handle add to cart functionality   
        addToCart(activity) {
            if (activity.spaces > 0) {
                // checking whether that lesson already exists in the cart
                const existingItem = this.cart.find(item => item._id === activity._id  );

                if (existingItem) {
                    if (activity.spaces > 0) {
                        existingItem.quantity++;
                        activity.spaces--; 
                    }
                } else {
                    // add new lesson to the cart with initial qty of 1
                    this.cart.push({
                        ...activity,  
                        quantity: 1
                    });
                    activity.spaces--; 
                }
                // update the cart counter on the screen
                this.updateCartItemsCount();
            }
        },
        
        // increase lesson's quantity in the cart 
        increaseQuantity(index) {
            const cartItem = this.cart[index];
            const originalActivity = this.Activities.find(activity => 
                activity._id === cartItem._id  
            );

            // we increase the quantity only if spaces are available
            if (originalActivity && originalActivity.spaces > 0) {
                cartItem.quantity++;
                originalActivity.spaces--; 
                this.updateCartItemsCount();
            }    
        },

        // decrease quantity or remove an item from the cart 
        decreaseQuantity(index) {
            const cartItem = this.cart[index];
            const originalActivity = this.Activities.find(activity => activity._id === cartItem._id );

            if (cartItem.quantity > 1) {
                cartItem.quantity--;
                if (originalActivity) originalActivity.spaces++; 
                this.updateCartItemsCount();
            } else if (cartItem.quantity === 1) {
                this.removeFromCart(index);
            }
        },

        // removing a specific lesson from the cart
        removeFromCart(index) {
            const cartItem = this.cart[index];
            
            const originalActivity = this.Activities.find(activity => 
                    activity._id === cartItem._id  
            );
            // add back the spaces for the removed lesson
            if (originalActivity) {
                originalActivity.spaces += cartItem.quantity;
            }
            // remove the lesson from the cart array
            this.cart.splice(index, 1);
            this.updateCartItemsCount();
        },

        // calculates the sum of all items quantities in the cart 
        updateCartItemsCount() {
            this.cartItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        },

        // function to open lesson page when clicked on
        viewActivity(activity) {
            this.selectedActivity = activity;
            this.activityImages = activity.imageUrl
            this.selectedImage = this.activityImages[0];
            this.currentPage = 'activity-detail';
            window.scrollTo(0, 0);
        },

        // function to validate user's name, email and phone number
        validateAllFields() {
            const nameRegex = /^[A-Za-z\s]{2,}$/;
            this.nameValid = nameRegex.test(this.checkout.name.trim());
                
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            this.emailValid = emailRegex.test(this.checkout.email.trim());
                
            const phoneRegex = /^\d{8}$/;
            this.phoneValid = phoneRegex.test(this.checkout.phone.trim());
                
            return this.nameValid && this.emailValid && this.phoneValid;
        },

        processCheckout() {
            if (this.cart.length === 0) {
                    alert('Your cart is empty.');
                    return;
            }

            // show loader, hide confirmation if it was open
            this.isLoading = true;
            this.showConfirmation = false;
            this.loadingText = 'Processing your order...';
            // create the order details        
            this.createOrder()
                .then(orderResponse => {
                        this.loadingText = 'Checkout in progress..';
                        // call to update the lessons spaces
                        return this.updateLessonSpaces();
                })
                .then(() => {
                    console.log('All lessons updated successfully');
                    this.isLoading = false;
                    this.showOrderConfirmation();
                })
                .catch(error => {
                    console.error('Checkout failed:', error);
                    this.isLoading = false;
                    console.error('Error details:', error.message);
                    alert('Checkout failed: ' + error.message);
                });
        },
        // function to create and user's order to the server
        createOrder() {
            const orderData = {
                customerName: this.checkout.name,
                phone: this.checkout.phone,
                email: this.checkout.email, 
                lessons: this.cart.map(item => ({
                    lessonId: item._id,
                    topic: item.topic,
                    location: item.location,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: this.cartTotal
            };
             // we send the post request to create the user's order
            return fetch(`${this.serverBaseUrl}api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Order creation failed: ${response.status} - ${text}`);
                    });
                }
                return response.json();
            });
        },
        
        // function to update spaces for all lessons in the cart
        updateLessonSpaces() {
            const updatePromises = this.cart.map(item => {
                const newSpaces = item.spaces - item.quantity;
                
                const updateData = { spaces: newSpaces };
                return fetch(`${this.serverBaseUrl}api/lessons/${item._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`could not update spaces for ${item.topic}`);
                    }
                    return response.json();
                });
            });
            // we wait for all the lesson space updates to complete
            return Promise.all(updatePromises);
        },
        // display the order confirmation page
        showOrderConfirmation() {
            this.orderConfirmation = {
                email: this.checkout.email,
                name: this.checkout.name,
                phone: this.checkout.phone,
                total: this.cartTotal.toFixed(2)
            };
            this.showConfirmation = true;
        },
    
        closeConfirmation() {
            this.showConfirmation = false;
            this.clearCartAfterCheckout();
        },
         
        // reset the cart details for the next order
        clearCartAfterCheckout() {
            this.cart = [];
            this.cartItems = 0;
            this.checkout.name = '';
            this.checkout.phone = '';
            this.checkout.email = '';
            this.nameValid = true;
            this.phoneValid = true;
            this.emailValid = true;
                
            setTimeout(() => {
                this.currentPage = 'home';
            }, 1000);
        },

        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
        },
                
        openSidebar() {
            document.getElementById('sidebarMenu').classList.add('active');
            document.getElementById('sidebarOverlay').classList.add('active');
        },
                
        closeSidebar() {
            document.getElementById('sidebarMenu').classList.remove('active');
            document.getElementById('sidebarOverlay').classList.remove('active');
        }, 
    },
            
    mounted() {
        setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % 3;
        }, 5000);
                
        // Close sidebar when clicking overlay
        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            this.closeSidebar();
        });
    }
})
   