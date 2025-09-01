// store/hotelStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Sample hotel data - replace with your API data
const sampleHotels = [
  {
    id: 1,
    name: "Grand Palace Hotel",
    slug: "grand-palace-hotel",
    location: "New York, NY",
    price: 299,
    rating: 4.8,
    reviews: 1250,
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
    ],
    description: "Experience luxury at its finest in the heart of Manhattan. This elegant hotel offers world-class amenities, exceptional service, and breathtaking city views.",
    amenities: [
      "Free Wi-Fi",
      "Swimming Pool", 
      "Fitness Center",
      "Spa & Wellness",
      "Restaurant",
      "Room Service",
      "Business Center",
      "Concierge"
    ],
    roomTypes: [
      {
        type: "Standard Room",
        price: 299,
        description: "Comfortable room with city view",
        features: ["King Bed", "City View", "32\" TV", "Mini Bar"]
      },
      {
        type: "Deluxe Suite",
        price: 499,
        description: "Spacious suite with premium amenities",
        features: ["King Bed", "Living Area", "City View", "Balcony", "Premium Amenities"]
      },
      {
        type: "Presidential Suite",
        price: 899,
        description: "Ultimate luxury with panoramic views",
        features: ["Master Bedroom", "Living Room", "Dining Area", "Panoramic View", "Butler Service"]
      }
    ],
    policies: {
      checkIn: "3:00 PM",
      checkOut: "11:00 AM",
      cancellation: "Free cancellation up to 24 hours before check-in",
      pets: "Pet-friendly (additional charges may apply)"
    }
  },
  {
    id: 2,
    name: "Oceanview Resort",
    slug: "oceanview-resort",
    location: "Miami, FL",
    price: 399,
    rating: 4.6,
    reviews: 890,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"
    ],
    description: "Relax and unwind at this beautiful beachfront resort with stunning ocean views, pristine beaches, and tropical paradise atmosphere.",
    amenities: [
      "Beach Access",
      "Swimming Pool",
      "Water Sports",
      "Spa & Wellness",
      "Multiple Restaurants",
      "Bars & Lounges",
      "Kids Club",
      "Tennis Court"
    ],
    roomTypes: [
      {
        type: "Ocean View Room",
        price: 399,
        description: "Beautiful room overlooking the ocean",
        features: ["Queen Bed", "Ocean View", "Balcony", "Mini Fridge"]
      },
      {
        type: "Beach Villa",
        price: 699,
        description: "Private villa steps from the beach",
        features: ["King Bed", "Private Terrace", "Direct Beach Access", "Outdoor Shower"]
      }
    ],
    policies: {
      checkIn: "4:00 PM",
      checkOut: "12:00 PM", 
      cancellation: "Free cancellation up to 48 hours before check-in",
      pets: "No pets allowed"
    }
  },
  {
    id: 3,
    name: "Mountain Lodge Retreat",
    slug: "mountain-lodge-retreat",
    location: "Aspen, CO",
    price: 249,
    rating: 4.7,
    reviews: 567,
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
    ],
    description: "Escape to the mountains and enjoy cozy accommodations surrounded by pristine wilderness, perfect for outdoor enthusiasts and nature lovers.",
    amenities: [
      "Ski Access",
      "Fireplace Lounge",
      "Hot Tub",
      "Hiking Trails",
      "Restaurant",
      "Game Room",
      "Ski Equipment Rental",
      "Mountain Views"
    ],
    roomTypes: [
      {
        type: "Cozy Cabin Room",
        price: 249,
        description: "Rustic charm with modern comfort",
        features: ["Queen Bed", "Fireplace", "Mountain View", "Balcony"]
      },
      {
        type: "Lodge Suite",
        price: 449,
        description: "Spacious suite with premium mountain views",
        features: ["King Bed", "Living Area", "Fireplace", "Private Hot Tub"]
      }
    ],
    policies: {
      checkIn: "4:00 PM",
      checkOut: "11:00 AM",
      cancellation: "Free cancellation up to 72 hours before check-in",
      pets: "Pet-friendly (with restrictions)"
    }
  }
];

// Create the Zustand store
const useHotelStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        hotels: sampleHotels,
        loading: false,
        error: null,
        searchResults: [],
        favorites: [],
        bookingData: null,
        filters: {
          minPrice: 0,
          maxPrice: 1000,
          location: '',
          minRating: 0,
          amenities: []
        },

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        // Get hotel by ID
        getHotelById: (id) => {
          const { hotels } = get();
          return hotels.find(hotel => hotel.id === parseInt(id));
        },

        // Get hotel by slug
        getHotelBySlug: (slug) => {
          const { hotels } = get();
          return hotels.find(hotel => hotel.slug === slug);
        },

        // Search hotels
        searchHotels: (query, filters = {}) => {
          const { hotels } = get();
          let filteredHotels = [...hotels];

          if (query) {
            filteredHotels = filteredHotels.filter(hotel => 
              hotel.name.toLowerCase().includes(query.toLowerCase()) ||
              hotel.location.toLowerCase().includes(query.toLowerCase()) ||
              hotel.description.toLowerCase().includes(query.toLowerCase())
            );
          }

          // Apply filters
          if (filters.minPrice) {
            filteredHotels = filteredHotels.filter(hotel => hotel.price >= filters.minPrice);
          }
          if (filters.maxPrice) {
            filteredHotels = filteredHotels.filter(hotel => hotel.price <= filters.maxPrice);
          }
          if (filters.location) {
            filteredHotels = filteredHotels.filter(hotel => 
              hotel.location.toLowerCase().includes(filters.location.toLowerCase())
            );
          }
          if (filters.minRating) {
            filteredHotels = filteredHotels.filter(hotel => hotel.rating >= filters.minRating);
          }
          if (filters.amenities && filters.amenities.length > 0) {
            filteredHotels = filteredHotels.filter(hotel =>
              filters.amenities.every(amenity =>
                hotel.amenities.some(hotelAmenity =>
                  hotelAmenity.toLowerCase().includes(amenity.toLowerCase())
                )
              )
            );
          }

          set({ searchResults: filteredHotels });
          return filteredHotels;
        },

        // Set search filters
        setFilters: (newFilters) => set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

        // Clear search results
        clearSearchResults: () => set({ searchResults: [] }),

        // Favorites management
        addToFavorites: (hotelId) => set((state) => ({
          favorites: state.favorites.includes(hotelId) 
            ? state.favorites 
            : [...state.favorites, hotelId]
        })),

        removeFromFavorites: (hotelId) => set((state) => ({
          favorites: state.favorites.filter(id => id !== hotelId)
        })),

        isFavorite: (hotelId) => {
          const { favorites } = get();
          return favorites.includes(hotelId);
        },

        // Booking management
        setBookingData: (data) => set({ bookingData: data }),
        clearBookingData: () => set({ bookingData: null }),

        // Simulate API calls
        fetchHotels: async () => {
          set({ loading: true, error: null });
          try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real app, this would be an API call
            // const response = await fetch('/api/hotels');
            // const data = await response.json();
            set({ hotels: sampleHotels, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        fetchHotelById: async (id) => {
          set({ loading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const hotel = get().getHotelById(id);
            if (!hotel) {
              throw new Error('Hotel not found');
            }
            set({ loading: false });
            return hotel;
          } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
          }
        }
      }),
      {
        name: 'hotel-storage', // unique name for localStorage key
        partialize: (state) => ({
          favorites: state.favorites,
          filters: state.filters
        }) // only persist favorites and filters
      }
    ),
    {
      name: 'hotel-store' // name for devtools
    }
  )
);

export default useHotelStore;