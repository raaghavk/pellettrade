import { createClient } from '@supabase/supabase-js';
import BrowseClient from './BrowseClient';
import { PELLET_TYPES, INDIAN_STATES } from '@/lib/constants';

export const metadata = {
  title: 'Browse Biomass Pellets | PelletTrade',
  description: 'Browse and buy rice husk, wood, bagasse, and other biomass pellets from verified sellers across India. Compare prices, quality, and ratings.',
};

async function fetchListings() {
  try {
    const supabase = createClient(
      'https://cawowquolsqgbsouwhsr.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE'
    );

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!seller_id(name, rating, total_trades, location_city)
      `)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching listings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function BrowsePage() {
  const initialListings = await fetchListings();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Listings</h1>
        <p className="subtitle">{initialListings.length} listings available</p>
      </div>

      <BrowseClient initialListings={initialListings} />
    </div>
  );
}
