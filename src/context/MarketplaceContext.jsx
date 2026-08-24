import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { marketplaceService, rentalService, sosService, requestService } from '../services';
import { useAuth } from './AuthContext';
import { useToast } from '../components/common/Toast';

const MarketplaceContext = createContext();

export function MarketplaceProvider({ children }) {
  const { addToast } = useToast();
  const { user: authUser } = useAuth();

  const [items, setItems] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [savedItemIds, setSavedItemIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [notificationCount, setNotificationCount] = useState(2);

  const currentUser = useMemo(() => {
    return authUser || {
      id: 'user-001',
      name: 'Arjun Sharma',
      dept: 'Robotics & Automation',
      year: '3rd Year',
      campus: 'MIT Engineering Tech Campus',
      trustScore: 4.9,
      totalSwaps: 18,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: true
    };
  }, [authUser]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [authUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [itemList, rentalList, sosList, favoritesList] = await Promise.all([
        marketplaceService.getListings(),
        rentalService.getActiveRentals(currentUser?.id),
        sosService.getSosRequests(),
        marketplaceService.getFavorites(currentUser?.id)
      ]);
      setItems(itemList);
      setActiveRentals(rentalList);
      setSosRequests(sosList);
      setSavedItemIds(favoritesList);
    } catch (e) {
      console.error('Failed to load marketplace data', e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Save / Favorite
  const toggleSaveItem = async (itemId) => {
    try {
      const isNowFav = await marketplaceService.toggleFavorite(currentUser?.id, itemId);
      setSavedItemIds((prev) => {
        if (isNowFav) {
          addToast('Added to saved favorites ❤️', 'success');
          return [...prev, itemId];
        } else {
          addToast('Removed from saved favorites', 'info');
          return prev.filter((id) => id !== itemId);
        }
      });
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  // Add Item
  const addItem = async (newItemData) => {
    const createdItem = await marketplaceService.createListing(newItemData, currentUser);
    setItems((prev) => [createdItem, ...prev]);
    addToast(`"${createdItem.title}" listed successfully!`, 'success');
    return createdItem;
  };

  // Edit Item
  const editItem = async (id, updatedData) => {
    const updated = await marketplaceService.updateListing(id, updatedData);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item)));
    addToast('Listing updated successfully', 'success');
    return updated;
  };

  // Delete Item
  const deleteItem = async (id) => {
    await marketplaceService.deleteListing(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    addToast('Listing deleted', 'info');
    return true;
  };

  // Toggle Availability
  const toggleItemAvailability = async (id) => {
    const newAvail = await marketplaceService.toggleListingAvailability(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: newAvail } : item)));
    addToast(newAvail ? 'Item marked as Available' : 'Item marked as Unavailable / In Use', 'info');
    return newAvail;
  };

  // Rent Item Flow
  const rentItem = async (item, days = 4) => {
    const newRental = await rentalService.createRental(item, days, currentUser?.id);
    setActiveRentals((prev) => [newRental, ...prev]);
    addToast(`Rental initiated! ₹${(item.deposit || 0) + (item.price || 0) * days} authorized in Escrow.`, 'success');
    return newRental;
  };

  // Buy Item Flow
  const buyItem = async (item, note = '') => {
    await requestService.createRequest(
      {
        title: `Purchase: ${item.title}`,
        description: `Direct purchase inquiry. Note: ${note || 'Ready for lab handover.'}`,
        category: item.category,
        urgency: 'HIGH',
        maxBudget: item.price,
        neededByDate: 'Immediate Handover',
        campusLocation: item.location
      },
      currentUser
    );

    addToast(`Purchase request sent to ${item.owner?.name || 'seller'}! Meet at ${item.location}.`, 'success');
    return true;
  };

  // Borrow Item Flow
  const borrowItem = async (item, days = 3, note = '') => {
    await requestService.createRequest(
      {
        title: `Borrow: ${item.title}`,
        description: `Peer borrow request for ${days} days. Note: ${note || 'Will return in mint condition.'}`,
        category: item.category,
        urgency: 'MEDIUM',
        maxBudget: 0,
        neededByDate: `For ${days} days`,
        campusLocation: item.location
      },
      currentUser
    );

    addToast(`Borrow request sent to ${item.owner?.name || 'lender'}! Deposit of ₹${item.deposit || 0} held in Escrow.`, 'success');
    return true;
  };

  // Advance rental step
  const advanceRentalStep = async (rentalId) => {
    const updated = await rentalService.advanceRentalStep(rentalId);
    setActiveRentals((prev) => prev.map((r) => (r.id === rentalId ? updated : r)));
    addToast('Rental status advanced • Step verified!', 'success');
    return updated;
  };

  // SOS requests
  const addSosRequest = async (newSos) => {
    const created = await sosService.createSosRequest(newSos, currentUser);
    setSosRequests((prev) => [created, ...prev]);
    addToast('Emergency SOS Alert broadcasted across campus labs! ⚡', 'error');
    return created;
  };

  const matchSosRequest = async (sosId) => {
    const matched = await sosService.matchSosRequest(sosId, currentUser.id);
    setSosRequests((prev) => prev.map((s) => (s.id === sosId ? matched : s)));
    addToast('You matched with this SOS request! Contact requester.', 'success');
    return matched;
  };

  // Clear all filters helper
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('All');
    setSelectedCondition('All');
    setSelectedLocation('');
    setPriceRange({ min: 0, max: 5000 });
    setAvailableOnly(false);
    setSortBy('featured');
    addToast('All filters cleared', 'info');
  };

  const isFilterActive = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== 'all' ||
      selectedType !== 'All' ||
      selectedCondition !== 'All' ||
      selectedLocation !== '' ||
      availableOnly === true ||
      priceRange.min > 0 ||
      priceRange.max < 5000 ||
      sortBy !== 'featured'
    );
  }, [
    searchQuery,
    selectedCategory,
    selectedType,
    selectedCondition,
    selectedLocation,
    availableOnly,
    priceRange,
    sortBy
  ]);

  // Filtered & Sorted items computation
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          item.title?.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.specs && item.specs.some((s) => s.label?.toLowerCase().includes(q) || s.value?.toLowerCase().includes(q)));

        const matchesCategory =
          selectedCategory === 'all' || (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

        const matchesType =
          selectedType === 'All' || (item.type && item.type.toLowerCase() === selectedType.toLowerCase());

        const matchesCondition =
          selectedCondition === 'All' || (item.condition && item.condition.toLowerCase() === selectedCondition.toLowerCase());

        const price = Number(item.price) || 0;
        const matchesPrice = price >= priceRange.min && price <= priceRange.max;

        const matchesAvailability = !availableOnly || item.available === true;

        const matchesLocation =
          !selectedLocation || (item.location && item.location.toLowerCase().includes(selectedLocation.toLowerCase()));

        return (
          matchesSearch &&
          matchesCategory &&
          matchesType &&
          matchesCondition &&
          matchesPrice &&
          matchesAvailability &&
          matchesLocation
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return (a.price || 0) - (b.price || 0);
          case 'price_desc':
            return (b.price || 0) - (a.price || 0);
          case 'rating':
            return (b.owner?.rating || 0) - (a.owner?.rating || 0);
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'featured':
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [
    items,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedCondition,
    priceRange,
    availableOnly,
    selectedLocation,
    sortBy
  ]);

  // Saved / Favorited items array
  const favoriteItems = useMemo(() => {
    return items.filter((item) => savedItemIds.includes(item.id));
  }, [items, savedItemIds]);

  // My listings (where owner is current user)
  const myListings = useMemo(() => {
    return items.filter(
      (item) => item.owner?.name === currentUser.name || item.ownerId === currentUser.id || item.ownerId === 'user-001'
    );
  }, [items, currentUser]);

  return (
    <MarketplaceContext.Provider
      value={{
        items,
        filteredItems,
        favoriteItems,
        myListings,
        activeRentals,
        sosRequests,
        user: currentUser,
        loading,
        // Search & Filters
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedType,
        setSelectedType,
        selectedCondition,
        setSelectedCondition,
        selectedLocation,
        setSelectedLocation,
        priceRange,
        setPriceRange,
        availableOnly,
        setAvailableOnly,
        sortBy,
        setSortBy,
        clearFilters,
        isFilterActive,
        // Favorites
        savedItemIds,
        toggleSaveItem,
        // CRUD & Flows
        addItem,
        editItem,
        deleteItem,
        toggleItemAvailability,
        rentItem,
        buyItem,
        borrowItem,
        advanceRentalStep,
        addSosRequest,
        matchSosRequest,
        notificationCount,
        setNotificationCount,
        refreshMarketplace: loadAllData
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
