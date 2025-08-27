import { EncryptedStorage } from './EncryptedStorage';

interface BookingRequest {
  patientName: string;
  phone?: string;
  email?: string;
  preferredTime: string;
  symptoms?: string;
  location?: string;
  language?: string;
}

interface BookingResponse {
  success: boolean;
  bookingId?: string;
  appointmentTime?: string;
  confirmationCode?: string;
  message: string;
  error?: string;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: {
    [key: string]: { open: string; close: string; };
  };
  services: string[];
  timezone: string;
}

export class HealthcareBooking {
  private storage: EncryptedStorage;
  private clinics: Clinic[] = [
    {
      id: 'clinic_001',
      name: 'The Joint Chiropractic - Downtown',
      address: '123 Main St, Downtown',
      phone: '(555) 123-4567',
      hours: {
        monday: { open: '8:00', close: '19:00' },
        tuesday: { open: '8:00', close: '19:00' },
        wednesday: { open: '8:00', close: '19:00' },
        thursday: { open: '8:00', close: '19:00' },
        friday: { open: '8:00', close: '19:00' },
        saturday: { open: '9:00', close: '17:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      services: ['Initial Consultation', 'Adjustment', 'Wellness Plan'],
      timezone: 'America/New_York'
    },
    {
      id: 'clinic_002', 
      name: 'The Joint Chiropractic - Westside',
      address: '456 Oak Ave, Westside',
      phone: '(555) 987-6543',
      hours: {
        monday: { open: '7:00', close: '20:00' },
        tuesday: { open: '7:00', close: '20:00' },
        wednesday: { open: '7:00', close: '20:00' },
        thursday: { open: '7:00', close: '20:00' },
        friday: { open: '7:00', close: '20:00' },
        saturday: { open: '8:00', close: '18:00' },
        sunday: { open: '9:00', close: '17:00' }
      },
      services: ['Initial Consultation', 'Adjustment', 'Wellness Plan', 'Family Plans'],
      timezone: 'America/New_York'
    }
  ];

  constructor(storage: EncryptedStorage) {
    this.storage = storage;
  }

  async bookAppointment(request: BookingRequest): Promise<BookingResponse> {
    try {
      // Validate booking request
      const validation = this.validateBookingRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message || 'Invalid booking request',
          error: 'validation_failed'
        };
      }

      // Find available clinic
      const selectedClinic = this.selectBestClinic(request);
      if (!selectedClinic) {
        return {
          success: false,
          message: 'No clinics available in your area. Please call 1-800-THE-JOINT for assistance.',
          error: 'no_clinic_available'
        };
      }

      // Parse preferred time and find available slot
      const availableSlot = await this.findAvailableSlot(selectedClinic, request.preferredTime);
      if (!availableSlot) {
        return {
          success: false,
          message: 'Your preferred time is not available. Our next available appointments are tomorrow morning at 9:00 AM or afternoon at 2:00 PM.',
          error: 'no_slot_available'
        };
      }

      // Generate booking
      const bookingId = this.generateBookingId();
      const confirmationCode = this.generateConfirmationCode();

      const booking = {
        id: bookingId,
        patientData: {
          name: request.patientName,
          phone: request.phone,
          email: request.email,
          symptoms: request.symptoms,
          language: request.language || 'English'
        },
        appointment: {
          clinicId: selectedClinic.id,
          clinicName: selectedClinic.name,
          clinicAddress: selectedClinic.address,
          clinicPhone: selectedClinic.phone,
          dateTime: availableSlot.datetime,
          service: 'Initial Consultation',
          duration: 30
        },
        confirmationCode,
        timestamp: new Date(),
        status: 'confirmed'
      };

      // Store encrypted booking
      await this.storage.storeBooking(`booking_session_${bookingId}`, booking);

      // In production, this would integrate with actual clinic scheduling system
      console.log('[HEALTHCARE-BOOKING] Appointment booked:', booking);

      // Send confirmation (simulated)
      await this.sendConfirmation(booking);

      return {
        success: true,
        bookingId,
        appointmentTime: availableSlot.formatted,
        confirmationCode,
        message: `Perfect! I've scheduled your appointment at ${selectedClinic.name} on ${availableSlot.formatted}. Your confirmation code is ${confirmationCode}. You'll receive a confirmation text shortly. Please arrive 15 minutes early for your initial consultation.`
      };

    } catch (error) {
      console.error('Booking error:', error);
      return {
        success: false,
        message: 'I encountered an issue while booking your appointment. Please call us directly at 1-800-THE-JOINT and we\'ll get you scheduled right away.',
        error: 'booking_system_error'
      };
    }
  }

  private validateBookingRequest(request: BookingRequest): { valid: boolean; message?: string } {
    if (!request.patientName || request.patientName.trim().length < 2) {
      return { valid: false, message: 'Please provide your full name for the appointment.' };
    }

    if (!request.phone && !request.email) {
      return { valid: false, message: 'Please provide either a phone number or email address so we can confirm your appointment.' };
    }

    if (request.phone && !this.isValidPhone(request.phone)) {
      return { valid: false, message: 'Please provide a valid phone number.' };
    }

    if (request.email && !this.isValidEmail(request.email)) {
      return { valid: false, message: 'Please provide a valid email address.' };
    }

    if (!request.preferredTime || request.preferredTime.trim().length === 0) {
      return { valid: false, message: 'Please let me know when you\'d prefer to schedule your appointment.' };
    }

    return { valid: true };
  }

  private selectBestClinic(request: BookingRequest): Clinic | null {
    // Simple location matching - in production would use geolocation
    if (request.location) {
      const location = request.location.toLowerCase();
      if (location.includes('downtown') || location.includes('center') || location.includes('main')) {
        return this.clinics[0]; // Downtown clinic
      }
      if (location.includes('west') || location.includes('oak')) {
        return this.clinics[1]; // Westside clinic
      }
    }

    // Default to first available clinic
    return this.clinics[0];
  }

  private async findAvailableSlot(clinic: Clinic, preferredTime: string): Promise<{ datetime: Date; formatted: string } | null> {
    const now = new Date();
    
    // Parse preferred time (simplified - in production would use sophisticated parsing)
    let targetDate = new Date();
    
    const timeText = preferredTime.toLowerCase();
    
    // Basic time parsing
    if (timeText.includes('tomorrow')) {
      targetDate.setDate(now.getDate() + 1);
    } else if (timeText.includes('next week')) {
      targetDate.setDate(now.getDate() + 7);
    } else if (timeText.includes('monday')) {
      targetDate = this.getNextWeekday(1); // Monday
    } else if (timeText.includes('tuesday')) {
      targetDate = this.getNextWeekday(2); // Tuesday
    } else if (timeText.includes('wednesday')) {
      targetDate = this.getNextWeekday(3); // Wednesday
    } else if (timeText.includes('thursday')) {
      targetDate = this.getNextWeekday(4); // Thursday
    } else if (timeText.includes('friday')) {
      targetDate = this.getNextWeekday(5); // Friday
    }

    // Set time based on preference
    if (timeText.includes('morning') || timeText.includes('9') || timeText.includes('10')) {
      targetDate.setHours(9, 0, 0, 0);
    } else if (timeText.includes('afternoon') || timeText.includes('2') || timeText.includes('3')) {
      targetDate.setHours(14, 0, 0, 0);
    } else if (timeText.includes('evening') || timeText.includes('5') || timeText.includes('6')) {
      targetDate.setHours(17, 0, 0, 0);
    } else {
      // Default to next available morning slot
      targetDate.setHours(9, 0, 0, 0);
    }

    // Ensure it's in the future
    if (targetDate <= now) {
      targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      targetDate.setHours(9, 0, 0, 0);
    }

    return {
      datetime: targetDate,
      formatted: targetDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  }

  private getNextWeekday(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    return nextDate;
  }

  private generateBookingId(): string {
    return `TJC_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private async sendConfirmation(booking: any): Promise<void> {
    // Simulate confirmation sending
    console.log('[CONFIRMATION] Appointment confirmation sent:', {
      patient: booking.patientData.name,
      phone: booking.patientData.phone,
      email: booking.patientData.email,
      appointment: booking.appointment.dateTime,
      clinic: booking.appointment.clinicName,
      confirmationCode: booking.confirmationCode
    });

    // In production, this would:
    // 1. Send SMS via Twilio/similar service
    // 2. Send email confirmation
    // 3. Add to clinic's scheduling system
    // 4. Set up reminder notifications
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getClinicAvailability(clinicId: string, date: Date): Promise<string[]> {
    const clinic = this.clinics.find(c => c.id === clinicId);
    if (!clinic) return [];

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours = clinic.hours[dayName];
    
    if (!hours) return [];

    // Generate available slots (simplified)
    const slots: string[] = [];
    const [openHour] = hours.open.split(':').map(Number);
    const [closeHour] = hours.close.split(':').map(Number);

    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(`${hour}:00`);
      if (hour < closeHour - 1) {
        slots.push(`${hour}:30`);
      }
    }

    return slots;
  }

  getClinics(): Clinic[] {
    return this.clinics;
  }

  async getBookingsByDate(date: Date): Promise<any[]> {
    // In production, this would query the booking database
    return [];
  }
}

export default HealthcareBooking;