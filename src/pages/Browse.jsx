import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/ListingCard';
import { Filter, Search } from 'lucide-react';
import { PELLET_TYPES, INDIAN_STATES } from '../lib/constants';

const Browse = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    pelletType: '',
    minPrice: '',
    maxPrice: '',
    location_state: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            seller:users!seller_id(name, rating, total_trades, location_city)
          `)
          .eq('status', 'active');

        if (error) throw error;

        setListings(data || []);
        setFilteredListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    let result = [...listings];

    if (filters.pelletType) {
      result = result.filter(l => l.pellet_type === filters.pelletType);
    }

    if (filters.minPrice) {
      result = result.filter(l => l.price_per_tonne >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter(l => l.price_per_tonne <= parseInt(filters.maxPrice));
    }

    if (filters.location_state) {
      result = result.filter(l => l.location_state === filters.location_state);
    }

    if (filters.sortBy === 'price-low') {
      result.sort((a, b) => a.price_per_tonne - b.price_per_tonne);
    } else if (filters.sortBy === 'price-high') {
      result.sort((a, b) => b.price_per_tonne - a.price_per_tonne);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.seller?.rating || 0) - (a.seller?.rating || 0));
    } else {
      result.reverse(); // Newest first (default)
    }

    setFilteredListings(result);
  }, [listings, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      pelletType: '',
      minPrice: '',
      maxPrice: '',
      location_state: '',
      sortBy: 'newest',
    });
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Listings</h1>
        <p className="subtitle">{filteredListings.length} listings available</p>
      </div>

      {/* Filter Toggle */}
      <div className="filter-bar">
        <button
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="form-group">
            <label>Pellet Type</label>
            <select
              value={filters.pelletType}
              onChange={(e) => handleFilterChange('pelletType', e.target.value)}
            >
              <option value="">All Types</option>
              {PELLET_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price Range (₹/tonne)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>State</label>
            <select
              value={filters.location_state}
              onChange={(e) => handleFilterChange('location_state', e.target.value)}
            >
              <option value="">All States</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <button
            className="btn btn-secondary btn-block"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h2>No listings found</h2>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => navigate(`/listing/${listing.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
