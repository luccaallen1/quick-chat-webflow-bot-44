import CryptoJS from 'crypto-js';

interface StorageConfig {
  encryptionKey: string;
  auditLogging: boolean;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  encrypted: boolean;
  classification?: string;
}

interface Booking {
  id: string;
  patientData: any;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface StorageEntry {
  id: string;
  data: string; // encrypted
  timestamp: Date;
  type: 'message' | 'booking' | 'audit';
  sessionId: string;
}

export class EncryptedStorage {
  private encryptionKey: string;
  private auditLogging: boolean;
  private storage: Map<string, StorageEntry> = new Map();
  private sessionData: Map<string, any> = new Map();

  constructor(config: StorageConfig) {
    this.encryptionKey = config.encryptionKey;
    this.auditLogging = config.auditLogging;
    
    // Initialize with existing data from localStorage if available
    this.loadFromLocalStorage();
  }

  async storeMessage(sessionId: string, message: Message): Promise<void> {
    try {
      const encryptedData = this.encrypt(JSON.stringify(message));
      
      const entry: StorageEntry = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        data: encryptedData,
        timestamp: new Date(),
        type: 'message',
        sessionId: this.hashSessionId(sessionId)
      };

      this.storage.set(entry.id, entry);
      
      // Update session data
      if (!this.sessionData.has(sessionId)) {
        this.sessionData.set(sessionId, { messages: [], bookings: [] });
      }
      
      this.sessionData.get(sessionId).messages.push(message);
      
      // Persist to localStorage (encrypted)
      this.saveToLocalStorage();
      
      if (this.auditLogging) {
        this.logAuditEvent('message_stored', {
          sessionId,
          messageId: entry.id,
          timestamp: entry.timestamp
        });
      }

    } catch (error) {
      console.error('Failed to store message:', error);
      throw new Error('HIPAA storage violation: Message encryption failed');
    }
  }

  async storeBooking(sessionId: string, booking: Booking): Promise<void> {
    try {
      // Encrypt sensitive patient data
      const encryptedData = this.encrypt(JSON.stringify(booking));
      
      const entry: StorageEntry = {
        id: booking.id,
        data: encryptedData,
        timestamp: new Date(),
        type: 'booking',
        sessionId: this.hashSessionId(sessionId)
      };

      this.storage.set(entry.id, entry);
      
      // Update session data
      if (!this.sessionData.has(sessionId)) {
        this.sessionData.set(sessionId, { messages: [], bookings: [] });
      }
      
      this.sessionData.get(sessionId).bookings.push(booking);
      
      // Persist to localStorage (encrypted)
      this.saveToLocalStorage();
      
      if (this.auditLogging) {
        this.logAuditEvent('booking_stored', {
          sessionId,
          bookingId: booking.id,
          timestamp: entry.timestamp,
          status: booking.status
        });
      }

      // In production, this would also sync to secure backend
      console.log('[HIPAA-STORAGE] Booking stored securely:', booking.id);

    } catch (error) {
      console.error('Failed to store booking:', error);
      throw new Error('HIPAA storage violation: Booking encryption failed');
    }
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      const sessionHash = this.hashSessionId(sessionId);
      const messages: Message[] = [];

      for (const [id, entry] of this.storage.entries()) {
        if (entry.sessionId === sessionHash && entry.type === 'message') {
          const decryptedData = this.decrypt(entry.data);
          const message = JSON.parse(decryptedData);
          messages.push(message);
        }
      }

      return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Failed to retrieve session messages:', error);
      return [];
    }
  }

  async getSessionBookings(sessionId: string): Promise<Booking[]> {
    try {
      const sessionHash = this.hashSessionId(sessionId);
      const bookings: Booking[] = [];

      for (const [id, entry] of this.storage.entries()) {
        if (entry.sessionId === sessionHash && entry.type === 'booking') {
          const decryptedData = this.decrypt(entry.data);
          const booking = JSON.parse(decryptedData);
          bookings.push(booking);
        }
      }

      return bookings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Failed to retrieve session bookings:', error);
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionHash = this.hashSessionId(sessionId);
      const toDelete: string[] = [];

      for (const [id, entry] of this.storage.entries()) {
        if (entry.sessionId === sessionHash) {
          toDelete.push(id);
        }
      }

      toDelete.forEach(id => this.storage.delete(id));
      this.sessionData.delete(sessionId);
      
      this.saveToLocalStorage();

      if (this.auditLogging) {
        this.logAuditEvent('session_deleted', {
          sessionId,
          itemsDeleted: toDelete.length,
          timestamp: new Date()
        });
      }

      console.log('[HIPAA-STORAGE] Session data securely deleted:', sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw new Error('HIPAA storage violation: Failed to delete session data');
    }
  }

  async purgeExpiredData(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const toDelete: string[] = [];
      
      for (const [id, entry] of this.storage.entries()) {
        if (entry.timestamp < cutoffDate) {
          toDelete.push(id);
        }
      }

      toDelete.forEach(id => this.storage.delete(id));
      this.saveToLocalStorage();

      if (this.auditLogging) {
        this.logAuditEvent('data_purged', {
          itemsPurged: toDelete.length,
          cutoffDate,
          timestamp: new Date()
        });
      }

      console.log(`[HIPAA-STORAGE] Purged ${toDelete.length} expired entries`);
    } catch (error) {
      console.error('Failed to purge expired data:', error);
    }
  }

  private encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('HIPAA encryption failure');
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Decryption produced empty result');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('HIPAA decryption failure');
    }
  }

  private hashSessionId(sessionId: string): string {
    return CryptoJS.SHA256(sessionId + this.encryptionKey).toString();
  }

  private saveToLocalStorage(): void {
    try {
      // Convert storage map to array for serialization
      const storageArray = Array.from(this.storage.entries());
      const encryptedStorage = this.encrypt(JSON.stringify(storageArray));
      
      localStorage.setItem('hipaa_encrypted_storage', encryptedStorage);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Don't throw error - this is just persistence, not critical for operation
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const encryptedData = localStorage.getItem('hipaa_encrypted_storage');
      if (encryptedData) {
        const decryptedData = this.decrypt(encryptedData);
        const storageArray = JSON.parse(decryptedData);
        
        // Restore storage map from array
        this.storage = new Map(storageArray);
        
        // Rebuild session data from storage
        this.rebuildSessionData();
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('hipaa_encrypted_storage');
      this.storage.clear();
    }
  }

  private rebuildSessionData(): void {
    this.sessionData.clear();
    
    for (const [id, entry] of this.storage.entries()) {
      try {
        const decryptedData = this.decrypt(entry.data);
        const data = JSON.parse(decryptedData);
        
        // This is a simplified rebuild - in production, you'd want to properly
        // group by actual session ID rather than hash
        if (entry.type === 'message') {
          // Would need to track original session IDs for proper rebuild
          console.log('Message entry found in storage:', id);
        } else if (entry.type === 'booking') {
          console.log('Booking entry found in storage:', id);
        }
      } catch (error) {
        console.error('Failed to rebuild session data for entry:', id, error);
      }
    }
  }

  private logAuditEvent(event: string, data: any): void {
    try {
      const auditEntry = {
        event,
        data: this.encrypt(JSON.stringify(data)),
        timestamp: new Date()
      };

      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const storageEntry: StorageEntry = {
        id: auditId,
        data: this.encrypt(JSON.stringify(auditEntry)),
        timestamp: new Date(),
        type: 'audit',
        sessionId: 'system'
      };

      this.storage.set(auditId, storageEntry);
      
      console.log(`[HIPAA-AUDIT] ${event} logged at ${auditEntry.timestamp}`);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  getStorageStats(): { totalEntries: number; messageCount: number; bookingCount: number; auditCount: number } {
    let messageCount = 0;
    let bookingCount = 0;
    let auditCount = 0;

    for (const entry of this.storage.values()) {
      switch (entry.type) {
        case 'message':
          messageCount++;
          break;
        case 'booking':
          bookingCount++;
          break;
        case 'audit':
          auditCount++;
          break;
      }
    }

    return {
      totalEntries: this.storage.size,
      messageCount,
      bookingCount,
      auditCount
    };
  }

  // Method to verify HIPAA compliance status
  verifyHIPAACompliance(): { compliant: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!this.encryptionKey || this.encryptionKey.length < 32) {
      issues.push('Encryption key is too weak');
    }

    if (!this.auditLogging) {
      issues.push('Audit logging is disabled');
    }

    // Check if any unencrypted data exists
    for (const entry of this.storage.values()) {
      if (!entry.data || !entry.data.includes('U2FsdGVkX1')) { // Basic AES encryption check
        issues.push('Unencrypted data detected in storage');
        break;
      }
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }
}

export default EncryptedStorage;