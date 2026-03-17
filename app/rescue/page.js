import { createClient } from '@supabase/supabase-js';
import RescueClient from './RescueClient';

export const metadata = {
  title: 'Flash Deals on Biomass Pellets | PelletTrade',
  description: 'Limited-time flash deals on biomass pellets. Get steep discounts on rice husk, wood, and bagasse pellets from sellers with excess stock.',
};

async function fetchRescueAlerts() {
  try {
    const supabase = createClient(
      'https://cawowquolsqgbsouwhsr.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhd293cXVvbHNxZ2Jzb3V3aHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODE2NjUsImV4cCI6MjA4OTI1NzY2NX0.w3YcESxMlt7JJW-k4nXv_6gdO2Ml09U1pFaVGDmUwaE'
    );

    const { data, error } = await supabase
      .from('rescue_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rescue alerts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching rescue alerts:', error);
    return [];
  }
}

export default async function RescuePage() {
  const alerts = await fetchRescueAlerts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Flash Deals</h1>
        <p className="subtitle">⚡ Limited time offers</p>
      </div>

      <RescueClient initialAlerts={alerts} />
    </div>
  );
}
