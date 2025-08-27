import { supabase } from '@/lib/supabase';
import { BotConfiguration } from '@/types/botConfiguration';

export interface DatabaseBotConfiguration extends BotConfiguration {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const configService = {
  // Get all configurations for the current user
  async getUserConfigurations(): Promise<DatabaseBotConfiguration[]> {
    const { data, error } = await supabase
      .from('bot_configurations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching configurations:', error);
      throw error;
    }

    return data || [];
  },

  // Save a new configuration
  async saveConfiguration(config: BotConfiguration, name: string): Promise<DatabaseBotConfiguration> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const configToSave = {
      user_id: userData.user.id,
      name,
      clinic_id: config.clinicId,
      clinic_name: config.clinicName,
      phone_number: config.phoneNumber,
      operation_hours: config.operationHours,
      microsite_url: config.micrositeUrl,
      address: config.address,
      address_description: config.addressDescription,
      state: config.state,
      time_zone: config.timeZone,
      time_zone_offset: config.timeZoneOffset,
      booking_link: config.bookingLink,
      available_time_slots: config.availableTimeSlots,
      time_intervals: config.timeIntervals,
      wellness_plan_prices: config.wellnessPlanPrices,
      calendar_id: config.calendarId,
      booking_calendar_id: config.bookingCalendarId,
      clinic_email: config.clinicEmail,
      base_id: config.baseId,
      table_id: config.tableId,
      booking_workflow: config.bookingWorkflow,
      plan_price: config.planPrice,
    };

    const { data, error } = await supabase
      .from('bot_configurations')
      .insert([configToSave])
      .select()
      .single();

    if (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }

    return data;
  },

  // Update an existing configuration
  async updateConfiguration(id: string, config: BotConfiguration, name: string): Promise<DatabaseBotConfiguration> {
    const configToUpdate = {
      name,
      clinic_id: config.clinicId,
      clinic_name: config.clinicName,
      phone_number: config.phoneNumber,
      operation_hours: config.operationHours,
      microsite_url: config.micrositeUrl,
      address: config.address,
      address_description: config.addressDescription,
      state: config.state,
      time_zone: config.timeZone,
      time_zone_offset: config.timeZoneOffset,
      booking_link: config.bookingLink,
      available_time_slots: config.availableTimeSlots,
      time_intervals: config.timeIntervals,
      wellness_plan_prices: config.wellnessPlanPrices,
      calendar_id: config.calendarId,
      booking_calendar_id: config.bookingCalendarId,
      clinic_email: config.clinicEmail,
      base_id: config.baseId,
      table_id: config.tableId,
      booking_workflow: config.bookingWorkflow,
      plan_price: config.planPrice,
    };

    const { data, error } = await supabase
      .from('bot_configurations')
      .update(configToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating configuration:', error);
      throw error;
    }

    return data;
  },

  // Delete a configuration
  async deleteConfiguration(id: string): Promise<void> {
    const { error } = await supabase
      .from('bot_configurations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting configuration:', error);
      throw error;
    }
  },

  // Get a single configuration by ID
  async getConfiguration(id: string): Promise<DatabaseBotConfiguration | null> {
    const { data, error } = await supabase
      .from('bot_configurations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching configuration:', error);
      return null;
    }

    return data;
  },

  // Convert database format to BotConfiguration format
  databaseToBot(dbConfig: DatabaseBotConfiguration): BotConfiguration {
    return {
      clinicId: dbConfig.clinic_id,
      clinicName: dbConfig.clinic_name,
      phoneNumber: dbConfig.phone_number,
      operationHours: dbConfig.operation_hours,
      micrositeUrl: dbConfig.microsite_url,
      address: dbConfig.address,
      addressDescription: dbConfig.address_description,
      state: dbConfig.state,
      timeZone: dbConfig.time_zone,
      timeZoneOffset: dbConfig.time_zone_offset,
      bookingLink: dbConfig.booking_link,
      availableTimeSlots: dbConfig.available_time_slots,
      timeIntervals: dbConfig.time_intervals,
      wellnessPlanPrices: dbConfig.wellness_plan_prices,
      calendarId: dbConfig.calendar_id,
      bookingCalendarId: dbConfig.booking_calendar_id,
      clinicEmail: dbConfig.clinic_email,
      baseId: dbConfig.base_id,
      tableId: dbConfig.table_id,
      bookingWorkflow: dbConfig.booking_workflow,
      planPrice: dbConfig.plan_price,
    };
  }
};