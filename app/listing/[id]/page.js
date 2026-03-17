import { createClient } from '@supabase/supabase-js';
import ListingDetailClient from './ListingDetailClient';

async function fetchListing(id) {
  try {
    const supabase = createClient(
      'https://cawowquolsqgbsouwhsr.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE'
    );

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!seller_id(name, business_name, rating, total_trades, location_city, location_state, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const listing = await fetchListing(params.id);

  if (!listing) {
    return {
      title: 'Listing Not Found | PelletTrade',
      description: 'The listing you are looking for does not exist.',
    };
  }

  const title = `${listing.pellet_type} Pellets - ₹${listing.price_per_tonne.toLocaleString('en-IN')}/tonne | PelletTrade`;
  const description = `Buy ${listing.pellet_type} biomass pellets at ₹${listing.price_per_tonne}/tonne. ${listing.quantity_tonnes} tonnes available from verified seller in ${listing.location_city}, ${listing.location_state}.`;

  return {
    title,
    description,
  };
}

export default async function ListingDetailPage({ params }) {
  const listing = await fetchListing(params.id);

  return (
    <div className="page-container">
      <ListingDetailClient listing={listing} listingId={params.id} />
    </div>
  );
}
