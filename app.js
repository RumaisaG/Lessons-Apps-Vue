let lessonApp = new Vue({
            el: '#app',
            data: {
                // to move from different pages
                currentPage: 'home',
                isDarkMode: false,

                // to store the different after school activities
                Activities: [],
                activityImages: [],
                
                selectedActivity: null,
              
                searchQuery: '',
                searchResults:[],
                showSearchDropdown: false,
                searching : false,
                searchTimeout: null,
                fullSearchResults: [],
                useSearchResults: false,
                
                selectedCategory: 'all',
                sortBy: 'featured',

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
                locations: [
                    'Port-Louis', 'Curepipe', 'Quatre Bornes', 'Rose-Hill', 'Vacoas'
                ],

                cartItems: 0,
                // to store the user's cart items
                cart: [],
                checkout: {
                    name: '',
                    email: '',
                    phone: '',
                    email: ''
                },

                // for checking whether the input fields pass the validation checks
                nameValid: true,
                phoneValid: true,
                emailValid: true,

                // to store the validation messages for the different input fields
                validationMessages: {
                        name: '',
                        phone: '',
                        email: ''
                },
            },
            
           
            created()  { 
                this.fetchActivities();
   
            },

            computed: {
        
                displayActivities() {
                    if (this.useSearchResults && this.fullSearchResults.length > 0) {
                        return this.fullSearchResults; 
                    }
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
                            return activity.days.some(day => selectedOption.value.includes(day));
                         });
                    }

                    this.$nextTick(() => {
                        this.scrollToResults();
                    });
    
                    
                    return activities;
                },
                
                sortedActivities() {
                    let activities = [...this.filteredActivities];
                    
                    switch(this.sortBy) {
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
                
                cartSubtotal() {
                    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                },
                
                
                serviceFee() {
                    return this.cartSubtotal * 0.05;
                },
                
                cartTotal() {
                    return this.cartSubtotal + this.serviceFee;
                },

                isCheckoutValid() {
                    const fieldsFilled = this.checkout.name.length > 0 && this.checkout.email.length > 0 &&  this.checkout.phone.length > 0;
                    return fieldsFilled && this.nameValid && this.emailValid && this.phoneValid;
                }
              
            },
            
            methods: {
                fetchActivities() {
                    return fetch("http://localhost:3000/api/lessons")
                        .then(response => response.json())
                        .then(data => {
                            this.Activities = data;
                            console.log('Loaded activities with IDs:', data.map(a => ({ topic: a.topic, _id: a._id })));
                        })
                        .catch(error => {
                            console.error("Error fetching activities:", error);
                        });
                },


            onSearchInput() {
                if (this.searchQuery.length === 0) {
                    this.hideSearchDropdown();
                    return;
                }

                clearTimeout(this.searchTimeout);
                            
                this.searching = true;
                this.showSearchDropdown = true;

              
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            },

            performSearch() {
                if (this.searchQuery.trim() === '') {
                    this.hideSearchDropdown();
                    return;
                }
                
                fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(this.searchQuery)}`)
                    .then(response => response.json())
                    .then(activity => {
                  
                        this.searchResults =activity ;
                        this.searching = false;
                        this.showSearchDropdown = true;
                    })
                    .catch(error => {
                        console.error('Search error:', error);
                        this.searchResults = [];
                        this.searching = false;
                    });
            },

          
            performFullSearch() {
                if (this.searchQuery.trim() === '') {
                    return;
                }

                this.hideSearchDropdown();
                this.currentPage = 'activities';
    
                this.searching = true;
                this.useSearchResults = true;
                
                fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(this.searchQuery)}`)
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
         
            hideSearchDropdown() {
                this.showSearchDropdown = false;
                this.searchResults = [];
                this.searching = false;
            },

         
            onSearchResultClick(activity) {
                this.viewActivity(activity);
                this.searchQuery = '';
                this.hideSearchDropdown();
            },

    
            onSearchBlur() {
                setTimeout(() => {
                    this.hideSearchDropdown();
                }, 200);
            },
     
            onSearchFocus() {
                if (this.searchQuery && this.searchResults.length > 0) {
                    this.showSearchDropdown = true;
                }
            },
            
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
                if (!this.validateAllFields()) {
                    alert('Please fix the validation errors.');
                    return;
                }
                
                if (this.cart.length === 0) {
                    alert('Your cart is empty.');
                    return;
                }
                    
                this.createOrder()
                    .then(orderResponse => {
                        return this.updateLessonSpaces().then(() => orderResponse);
                    })
                    .then(orderResponse => {
                        console.log('All lessons updated successfully');
                        this.showOrderConfirmation(orderResponse);
                    })
                    .catch(error => {
                        console.error('Checkout failed:', error);
                        console.error('Error details:', error.message);
                        alert('Checkout failed: ' + error.message);
                    });
            },

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
             
                
                return fetch('http://localhost:3000/api/orders', {
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
                
        updateLessonSpaces() {
            const updatePromises = this.cart.map(item => {
                const newSpaces = item.spaces - item.quantity;
                
                const updateData = { spaces: newSpaces };
                return fetch(`http://localhost:3000/api/lessons/${item._id}`, {
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
            return Promise.all(updatePromises);
        },
    
           
            showOrderConfirmation(orderResponse) {
            
                const message = 
                    `Your Order was submitted successfully\n\n` +
                    `Order ID: ${orderResponse.orderId}\n` +
                    `Customer: ${this.checkout.name}\n` +
                    `Phone: ${this.checkout.phone}\n\n` +
                    `Total: $${this.cartTotal.toFixed(2)}\n\n` +
                    `Thank you for supporting us`;
                
                alert(message);
                this.clearCartAfterCheckout();
            },
            
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
                
                filterByCategory(category) {
                    this.selectedCategory = category;
                    if (category === 'all') {
                        this.filters.categories = [];
                    } else {
                        this.filters.categories = [category];
                    }
                    this.currentPage = 'activities';
                },
                        
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
                
               addToCart(activity) {
                    if (activity.spaces > 0) {
                        const existingItem = this.cart.find(item => 
                            item._id === activity._id  
                        );

                        if (existingItem) {
                            if (activity.spaces > 0) {
                                existingItem.quantity++;
                                activity.spaces--; 
                            }
                        } else {
                            this.cart.push({
                                ...activity,  
                                quantity: 1
                            });
                            activity.spaces--; 
                        }
                        this.updateCartItemsCount();
                    }
                },

                increaseQuantity(index) {
                    const cartItem = this.cart[index];
                        const originalActivity = this.Activities.find(activity => 
                            activity._id === cartItem._id  
                        );

                        if (originalActivity && originalActivity.spaces > 0) {
                            cartItem.quantity++;
                            originalActivity.spaces--; 
                            this.updateCartItemsCount();
                        }    
                 },

            decreaseQuantity(index) {
                const cartItem = this.cart[index];
                const originalActivity = this.Activities.find(activity => 
                    activity._id === cartItem._id 
                );

                if (cartItem.quantity > 1) {
                    cartItem.quantity--;
                    if (originalActivity) originalActivity.spaces++; 
                    this.updateCartItemsCount();
                } else if (cartItem.quantity === 1) {
                    this.removeFromCart(index);
                }
            },

            removeFromCart(index) {
                const cartItem = this.cart[index];
                const originalActivity = this.Activities.find(activity => 
                    activity._id === cartItem._id  
                );

                if (originalActivity) {
                    originalActivity.spaces += cartItem.quantity;
                }
                this.cart.splice(index, 1);
                this.updateCartItemsCount();
            },

                updateCartItemsCount() {
                    this.cartItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
                },
    
                viewActivity(activity) {
                        this.selectedActivity = activity;
                        this.activityImages = activity.imageUrl
                        this.selectedImage = this.activityImages[0];
                        this.currentPage = 'activity-detail';
                        window.scrollTo(0, 0);
                },

                scrollToResults() {
                 
                    if (this.currentPage === 'activities' || this.currentPage === 'search') {
                        const resultsSection = document.getElementById('results-section');
                        if (resultsSection) {
                            // Get navbar height for offset
                            const navbar = document.querySelector('.navbar');
                            const navbarHeight = navbar ? navbar.offsetHeight : 0;
                            
                            // Scroll to results with offset (accounting for sticky navbar)
                            const targetPosition = resultsSection.offsetTop - navbarHeight - 20;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth' 
                            });
                        }
                    }
                }
                
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
   