import { ConfidentialClientApplication } from '@azure/msal-node';
import axios, { AxiosInstance } from 'axios';
import { DataverseResponse, Account, Contact, Opportunity } from '@/types';

class DataverseClient {
  private msalClient: ConfidentialClientApplication;
  private axiosInstance: AxiosInstance | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    const config = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID!,
        clientSecret: process.env.AZURE_CLIENT_SECRET!,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
      },
    };

    this.msalClient = new ConfidentialClientApplication(config);
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5-minute buffer)
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenRequest = {
      scopes: [`${process.env.DATAVERSE_URL}/.default`],
    };

    try {
      const response = await this.msalClient.acquireTokenByClientCredential(tokenRequest);
      
      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire access token');
      }

      this.accessToken = response.accessToken;
      // Set expiry with 5-minute buffer
      this.tokenExpiry = new Date(Date.now() + (response.expiresOn ? 
        response.expiresOn.getTime() - Date.now() - 300000 : 3300000));
      
      return this.accessToken;
    } catch (error) {
      console.error('Error acquiring token:', error);
      throw error;
    }
  }

  private async getAxiosInstance(): Promise<AxiosInstance> {
    const token = await this.getAccessToken();

    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: `${process.env.DATAVERSE_URL}/api/data/v9.2`,
        headers: {
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          'Prefer': 'odata.include-annotations="*"',
        },
      });
    }

    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return this.axiosInstance;
  }

  // Generic query method
  async query<T>(entitySet: string, options?: {
    select?: string[];
    filter?: string;
    orderby?: string;
    top?: number;
    skip?: number;
    expand?: string;
    count?: boolean;
  }): Promise<DataverseResponse<T>> {
    const client = await this.getAxiosInstance();
    
    const params = new URLSearchParams();
    
    if (options?.select?.length) {
      params.append('$select', options.select.join(','));
    }
    if (options?.filter) {
      params.append('$filter', options.filter);
    }
    if (options?.orderby) {
      params.append('$orderby', options.orderby);
    }
    if (options?.top) {
      params.append('$top', options.top.toString());
    }
    if (options?.skip) {
      params.append('$skip', options.skip.toString());
    }
    if (options?.expand) {
      params.append('$expand', options.expand);
    }
    if (options?.count) {
      params.append('$count', 'true');
    }

    const queryString = params.toString();
    const url = `/${entitySet}${queryString ? `?${queryString}` : ''}`;

    const response = await client.get(url);
    return response.data;
  }

  // Get single entity
  async getById<T>(entitySet: string, id: string, select?: string[]): Promise<T> {
    const client = await this.getAxiosInstance();
    
    let url = `/${entitySet}(${id})`;
    if (select?.length) {
      url += `?$select=${select.join(',')}`;
    }

    const response = await client.get(url);
    return response.data;
  }

  // Create entity
  async create<T>(entitySet: string, data: Partial<T>): Promise<string> {
    const client = await this.getAxiosInstance();
    
    const response = await client.post(`/${entitySet}`, data, {
      headers: {
        'Prefer': 'return=representation',
      },
    });

    // Extract ID from OData-EntityId header
    const entityId = response.headers['odata-entityid'];
    if (entityId) {
      const match = entityId.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    }
    
    return response.data;
  }

  // Update entity
  async update<T>(entitySet: string, id: string, data: Partial<T>): Promise<void> {
    const client = await this.getAxiosInstance();
    await client.patch(`/${entitySet}(${id})`, data);
  }

  // Delete entity
  async delete(entitySet: string, id: string): Promise<void> {
    const client = await this.getAxiosInstance();
    await client.delete(`/${entitySet}(${id})`);
  }

  // Convenience methods for common entities
  async getAccounts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Account>> {
    return this.query<Account>('accounts', options);
  }

  async getContacts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Contact>> {
    return this.query<Contact>('contacts', options);
  }

  async getOpportunities(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Opportunity>> {
    return this.query<Opportunity>('opportunities', options);
  }

  // Aggregate query for analytics
  async getAccountsRevenue(): Promise<{ total: number; byAccount: { name: string; revenue: number }[] }> {
    const accounts = await this.getAccounts({
      select: ['name', 'revenue'],
      filter: 'revenue ne null',
      orderby: 'revenue desc',
      top: 10,
    });

    const total = accounts.value.reduce((sum, acc) => sum + (acc.revenue || 0), 0);
    const byAccount = accounts.value.map(acc => ({
      name: acc.name,
      revenue: acc.revenue || 0,
    }));

    return { total, byAccount };
  }

  async getOpportunitiesByStage(): Promise<{ stage: string; count: number; value: number }[]> {
    const opportunities = await this.getOpportunities({
      select: ['statecode', 'estimatedvalue'],
    });

    const stages: Record<number, { stage: string; count: number; value: number }> = {
      0: { stage: 'Open', count: 0, value: 0 },
      1: { stage: 'Won', count: 0, value: 0 },
      2: { stage: 'Lost', count: 0, value: 0 },
    };

    opportunities.value.forEach(opp => {
      const stateCode = opp.statecode ?? 0;
      if (stages[stateCode]) {
        stages[stateCode].count++;
        stages[stateCode].value += opp.estimatedvalue || 0;
      }
    });

    return Object.values(stages);
  }
}

// Singleton instance
let dataverseClient: DataverseClient | null = null;

export function getDataverseClient(): DataverseClient {
  if (!dataverseClient) {
    dataverseClient = new DataverseClient();
  }
  return dataverseClient;
}

export { DataverseClient };
