import { supabase } from '@/lib/supabase';

// Provider types
export type ProviderType = 'calendar' | 'email' | 'messaging';
export type Provider = 'GOOGLE' | 'MICROSOFT' | 'IMAP' | 'WHATSAPP' | 'LINKEDIN' | 'INSTAGRAM' | 'MESSENGER' | 'TWITTER' | 'TELEGRAM';

export interface ProviderConfiguration {
  id: string;
  provider: Provider;
  provider_type: ProviderType;
  display_name: string;
  description: string;
  capabilities: string[];
  connection_flow: 'hosted_auth' | 'oauth' | 'api_key';
  is_active: boolean;
  configuration: Record<string, any>;
}

export interface ConnectedProvider {
  provider: Provider;
  provider_type: ProviderType;
  display_name: string;
  capabilities: string[];
  account_id: string;
  status: 'connected' | 'disconnected' | 'credentials_error';
  email?: string;
  connected_at: string;
}

export interface ConnectionStatus {
  total_connections: number;
  calendar_connections: number;
  email_connections: number;
  messaging_connections: number;
  connected_providers: ConnectedProvider[];
  available_providers: ProviderConfiguration[];
  capabilities: string[];
}

class MultiProviderService {
  private backendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://quick-chat-webflow-bot-44-production.up.railway.app'
    : 'http://localhost:3001'; // Use local backend in development

  /**
   * Get all available provider configurations
   */
  async getAvailableProviders(): Promise<ProviderConfiguration[]> {
    const { data, error } = await supabase
      .from('provider_configurations')
      .select('*')
      .eq('is_active', true)
      .order('provider_type', { ascending: true })
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching provider configurations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get providers by type
   */
  async getProvidersByType(providerType: ProviderType): Promise<ProviderConfiguration[]> {
    const providers = await this.getAvailableProviders();
    return providers.filter(p => p.provider_type === providerType);
  }

  /**
   * Get user's connected providers
   */
  async getConnectedProviders(): Promise<ConnectedProvider[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .rpc('get_user_connected_providers', {
        user_uuid: userData.user.id
      });

    if (error) {
      console.error('Error fetching connected providers:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get comprehensive connection status for user
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const [availableProviders, connectedProviders] = await Promise.all([
        this.getAvailableProviders(),
        this.getConnectedProviders()
      ]);

      // Count connections by type
      const calendar_connections = connectedProviders.filter(p => p.provider_type === 'calendar').length;
      const email_connections = connectedProviders.filter(p => p.provider_type === 'email').length;
      const messaging_connections = connectedProviders.filter(p => p.provider_type === 'messaging').length;

      // Get all available capabilities
      const capabilities = Array.from(new Set(
        connectedProviders.flatMap(p => p.capabilities)
      ));

      return {
        total_connections: connectedProviders.length,
        calendar_connections,
        email_connections,
        messaging_connections,
        connected_providers: connectedProviders,
        available_providers: availableProviders,
        capabilities
      };
    } catch (error) {
      console.error('Error getting connection status:', error);
      return {
        total_connections: 0,
        calendar_connections: 0,
        email_connections: 0,
        messaging_connections: 0,
        connected_providers: [],
        available_providers: [],
        capabilities: []
      };
    }
  }

  /**
   * Check if user has specific capability
   */
  async hasCapability(capability: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return false;
    }

    const { data, error } = await supabase
      .rpc('user_has_capability', {
        user_uuid: userData.user.id,
        capability_name: capability
      });

    if (error) {
      console.error('Error checking capability:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Initialize connection for any provider
   */
  async initializeConnection(
    provider: Provider,
    providerType: ProviderType,
    successRedirect?: string,
    failureRedirect?: string
  ): Promise<{ url: string; expiresOn: string }> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id,
        provider,
        providerType,
        successRedirect: successRedirect || `${window.location.origin}/integrations/success`,
        failureRedirect: failureRedirect || `${window.location.origin}/integrations/failure`
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize ${provider} connection`);
    }

    return await response.json();
  }

  /**
   * Disconnect a specific provider
   */
  async disconnect(provider: Provider, providerType: ProviderType): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id,
        provider,
        providerType
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect ${provider}`);
    }

    // Clean up local data
    const { data: mappingData } = await supabase
      .from('unipile_account_mappings')
      .select('id')
      .eq('user_identifier', userData.user.id)
      .eq('provider', provider)
      .eq('provider_type', providerType);

    if (mappingData && mappingData.length > 0) {
      await supabase
        .from('unipile_account_mappings')
        .delete()
        .eq('id', mappingData[0].id);
    }
  }

  /**
   * Get providers that support a specific capability
   */
  async getProvidersWithCapability(capability: string): Promise<ProviderConfiguration[]> {
    const providers = await this.getAvailableProviders();
    return providers.filter(p => p.capabilities.includes(capability));
  }

  /**
   * Get connected providers by type
   */
  async getConnectedProvidersByType(providerType: ProviderType): Promise<ConnectedProvider[]> {
    const connectedProviders = await this.getConnectedProviders();
    return connectedProviders.filter(p => p.provider_type === providerType);
  }

  /**
   * Get integration data for webhook payloads
   */
  async getIntegrationDataForWebhook(): Promise<Record<string, any>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return {};
      }

      const connectedProviders = await this.getConnectedProviders();
      const capabilities = Array.from(new Set(
        connectedProviders.flatMap(p => p.capabilities)
      ));

      const integrationData: Record<string, any> = {
        user_id: userData.user.id,
        total_integrations: connectedProviders.length,
        capabilities,
        providers: {}
      };

      // Group by provider type for easy access
      for (const provider of connectedProviders) {
        if (!integrationData.providers[provider.provider_type]) {
          integrationData.providers[provider.provider_type] = [];
        }
        
        integrationData.providers[provider.provider_type].push({
          provider: provider.provider,
          account_id: provider.account_id,
          capabilities: provider.capabilities,
          email: provider.email
        });
      }

      return integrationData;
    } catch (error) {
      console.error('Error getting integration data for webhook:', error);
      return {};
    }
  }
}

export const multiProviderService = new MultiProviderService();