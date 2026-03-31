import { ConfidentialClientApplication } from '@azure/msal-node';
import axios, { AxiosInstance } from 'axios';
import { DataverseResponse, Account, Contact, Opportunity } from '@/types';

// Demo data for when DEMO_MODE=true
const DEMO_ACCOUNTS: Account[] = [
  { accountid: '1', name: 'Contoso Ltd', revenue: 5200000, numberofemployees: 250, telephone1: '+49 69 1234567', emailaddress1: 'contact@contoso.de', websiteurl: 'https://contoso.com', address1_city: 'Frankfurt' },
  { accountid: '2', name: 'Fabrikam GmbH', revenue: 3800000, numberofemployees: 180, telephone1: '+49 89 9876543', emailaddress1: 'info@fabrikam.de', websiteurl: 'https://fabrikam.de', address1_city: 'Munich' },
  { accountid: '3', name: 'Adventure Works', revenue: 2900000, numberofemployees: 120, telephone1: '+49 30 5551234', emailaddress1: 'sales@adventureworks.de', websiteurl: 'https://adventureworks.com', address1_city: 'Berlin' },
  { accountid: '4', name: 'Northwind Traders', revenue: 2100000, numberofemployees: 85, telephone1: '+49 40 7778899', emailaddress1: 'hello@northwind.de', websiteurl: 'https://northwind.de', address1_city: 'Hamburg' },
  { accountid: '5', name: 'Tailspin Toys', revenue: 1500000, numberofemployees: 45, telephone1: '+49 711 4443322', emailaddress1: 'toys@tailspin.de', websiteurl: 'https://tailspin.de', address1_city: 'Stuttgart' },
  { accountid: '6', name: 'Blue Yonder Airlines', revenue: 8500000, numberofemployees: 520, telephone1: '+49 69 8887766', emailaddress1: 'fly@blueyonder.de', websiteurl: 'https://blueyonder.com', address1_city: 'Frankfurt' },
  { accountid: '7', name: 'Coho Vineyard', revenue: 950000, numberofemployees: 32, telephone1: '+49 6131 2223344', emailaddress1: 'wine@coho.de', websiteurl: 'https://cohovineyard.de', address1_city: 'Mainz' },
  { accountid: '8', name: 'Litware Inc', revenue: 4200000, numberofemployees: 200, telephone1: '+49 211 9998877', emailaddress1: 'contact@litware.de', websiteurl: 'https://litware.com', address1_city: 'Düsseldorf' },
];

const DEMO_CONTACTS: Contact[] = [
  { contactid: '1', firstname: 'Anna', lastname: 'Schmidt', emailaddress1: 'anna.schmidt@contoso.de', telephone1: '+49 69 1234567', jobtitle: 'CEO', _parentcustomerid_value: '1' },
  { contactid: '2', firstname: 'Max', lastname: 'Müller', emailaddress1: 'max.mueller@fabrikam.de', telephone1: '+49 89 9876543', jobtitle: 'CTO', _parentcustomerid_value: '2' },
  { contactid: '3', firstname: 'Sophie', lastname: 'Weber', emailaddress1: 'sophie.weber@adventureworks.de', telephone1: '+49 30 5551234', jobtitle: 'Sales Director', _parentcustomerid_value: '3' },
  { contactid: '4', firstname: 'Lukas', lastname: 'Fischer', emailaddress1: 'lukas.fischer@northwind.de', telephone1: '+49 40 7778899', jobtitle: 'Account Manager', _parentcustomerid_value: '4' },
  { contactid: '5', firstname: 'Emma', lastname: 'Wagner', emailaddress1: 'emma.wagner@tailspin.de', telephone1: '+49 711 4443322', jobtitle: 'Marketing Lead', _parentcustomerid_value: '5' },
  { contactid: '6', firstname: 'Leon', lastname: 'Becker', emailaddress1: 'leon.becker@blueyonder.de', telephone1: '+49 69 8887766', jobtitle: 'VP Operations', _parentcustomerid_value: '6' },
  { contactid: '7', firstname: 'Mia', lastname: 'Hoffmann', emailaddress1: 'mia.hoffmann@coho.de', telephone1: '+49 6131 2223344', jobtitle: 'Owner', _parentcustomerid_value: '7' },
  { contactid: '8', firstname: 'Felix', lastname: 'Koch', emailaddress1: 'felix.koch@litware.de', telephone1: '+49 211 9998877', jobtitle: 'CFO', _parentcustomerid_value: '8' },
  { contactid: '9', firstname: 'Hannah', lastname: 'Richter', emailaddress1: 'hannah.richter@contoso.de', telephone1: '+49 69 1234568', jobtitle: 'Developer', _parentcustomerid_value: '1' },
  { contactid: '10', firstname: 'Paul', lastname: 'Klein', emailaddress1: 'paul.klein@fabrikam.de', telephone1: '+49 89 9876544', jobtitle: 'Project Manager', _parentcustomerid_value: '2' },
];

const DEMO_OPPORTUNITIES: Opportunity[] = [
  { opportunityid: '1', name: 'Contoso ERP Implementation', estimatedvalue: 450000, statecode: 0, estimatedclosedate: '2026-04-15', _parentaccountid_value: '1' },
  { opportunityid: '2', name: 'Fabrikam Cloud Migration', estimatedvalue: 280000, statecode: 0, estimatedclosedate: '2026-05-01', _parentaccountid_value: '2' },
  { opportunityid: '3', name: 'Adventure Works CRM', estimatedvalue: 180000, statecode: 1, estimatedclosedate: '2026-02-28', _parentaccountid_value: '3' },
  { opportunityid: '4', name: 'Northwind Analytics Dashboard', estimatedvalue: 95000, statecode: 1, estimatedclosedate: '2026-01-15', _parentaccountid_value: '4' },
  { opportunityid: '5', name: 'Tailspin E-commerce Platform', estimatedvalue: 320000, statecode: 0, estimatedclosedate: '2026-06-30', _parentaccountid_value: '5' },
  { opportunityid: '6', name: 'Blue Yonder Booking System', estimatedvalue: 750000, statecode: 0, estimatedclosedate: '2026-07-15', _parentaccountid_value: '6' },
  { opportunityid: '7', name: 'Coho Inventory Management', estimatedvalue: 65000, statecode: 2, estimatedclosedate: '2026-01-20', _parentaccountid_value: '7' },
  { opportunityid: '8', name: 'Litware Power Platform', estimatedvalue: 220000, statecode: 1, estimatedclosedate: '2026-03-10', _parentaccountid_value: '8' },
  { opportunityid: '9', name: 'Contoso Mobile App', estimatedvalue: 180000, statecode: 1, estimatedclosedate: '2025-12-01', _parentaccountid_value: '1' },
  { opportunityid: '10', name: 'Fabrikam AI Integration', estimatedvalue: 520000, statecode: 0, estimatedclosedate: '2026-08-30', _parentaccountid_value: '2' },
  { opportunityid: '11', name: 'Blue Yonder Data Lake', estimatedvalue: 380000, statecode: 1, estimatedclosedate: '2025-11-15', _parentaccountid_value: '6' },
  { opportunityid: '12', name: 'Litware Security Audit', estimatedvalue: 45000, statecode: 2, estimatedclosedate: '2025-10-01', _parentaccountid_value: '8' },
];

// Demo client that returns mock data
class DemoDataverseClient {
  async query<T>(entitySet: string, options?: {
    select?: string[];
    filter?: string;
    orderby?: string;
    top?: number;
    skip?: number;
    expand?: string;
    count?: boolean;
  }): Promise<DataverseResponse<T>> {
    let data: unknown[] = [];
    
    if (entitySet === 'accounts') data = [...DEMO_ACCOUNTS];
    else if (entitySet === 'contacts') data = [...DEMO_CONTACTS];
    else if (entitySet === 'opportunities') data = [...DEMO_OPPORTUNITIES];

    // Apply filter (basic support)
    if (options?.filter) {
      if (options.filter.includes('statecode eq 1')) {
        data = (data as Opportunity[]).filter(d => d.statecode === 1);
      } else if (options.filter.includes('revenue ne null')) {
        data = (data as Account[]).filter(d => d.revenue != null);
      }
    }

    // Apply top
    if (options?.top) {
      data = data.slice(0, options.top);
    }

    // Apply orderby (basic support)
    if (options?.orderby?.includes('revenue desc')) {
      data = (data as Account[]).sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
    }

    const result: DataverseResponse<T> = {
      value: data as T[],
    };

    if (options?.count) {
      result['@odata.count'] = data.length;
    }

    return result;
  }

  async getById<T>(entitySet: string, id: string): Promise<T> {
    let data: unknown[] = [];
    let idField = 'id';
    
    if (entitySet === 'accounts') { data = DEMO_ACCOUNTS; idField = 'accountid'; }
    else if (entitySet === 'contacts') { data = DEMO_CONTACTS; idField = 'contactid'; }
    else if (entitySet === 'opportunities') { data = DEMO_OPPORTUNITIES; idField = 'opportunityid'; }

    const item = data.find((d: Record<string, unknown>) => d[idField] === id);
    if (!item) throw new Error('Not found');
    return item as T;
  }

  async create<T>(entitySet: string, data: Partial<T>): Promise<string> {
    // In demo mode, just return a fake ID
    return `demo-${Date.now()}`;
  }

  async update<T>(entitySet: string, id: string, data: Partial<T>): Promise<void> {
    // In demo mode, do nothing
  }

  async delete(entitySet: string, id: string): Promise<void> {
    // In demo mode, do nothing
  }

  async getAccounts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Account>> {
    return this.query<Account>('accounts', options);
  }

  async getContacts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Contact>> {
    return this.query<Contact>('contacts', options);
  }

  async getOpportunities(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Opportunity>> {
    return this.query<Opportunity>('opportunities', options);
  }

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

// Real Dataverse client
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
    
    if (options?.select?.length) params.append('$select', options.select.join(','));
    if (options?.filter) params.append('$filter', options.filter);
    if (options?.orderby) params.append('$orderby', options.orderby);
    if (options?.top) params.append('$top', options.top.toString());
    if (options?.skip) params.append('$skip', options.skip.toString());
    if (options?.expand) params.append('$expand', options.expand);
    if (options?.count) params.append('$count', 'true');

    const queryString = params.toString();
    const url = `/${entitySet}${queryString ? `?${queryString}` : ''}`;

    const response = await client.get(url);
    return response.data;
  }

  async getById<T>(entitySet: string, id: string, select?: string[]): Promise<T> {
    const client = await this.getAxiosInstance();
    
    let url = `/${entitySet}(${id})`;
    if (select?.length) url += `?$select=${select.join(',')}`;

    const response = await client.get(url);
    return response.data;
  }

  async create<T>(entitySet: string, data: Partial<T>): Promise<string> {
    const client = await this.getAxiosInstance();
    
    const response = await client.post(`/${entitySet}`, data, {
      headers: { 'Prefer': 'return=representation' },
    });

    const entityId = response.headers['odata-entityid'];
    if (entityId) {
      const match = entityId.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    }
    
    return response.data;
  }

  async update<T>(entitySet: string, id: string, data: Partial<T>): Promise<void> {
    const client = await this.getAxiosInstance();
    await client.patch(`/${entitySet}(${id})`, data);
  }

  async delete(entitySet: string, id: string): Promise<void> {
    const client = await this.getAxiosInstance();
    await client.delete(`/${entitySet}(${id})`);
  }

  async getAccounts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Account>> {
    return this.query<Account>('accounts', options);
  }

  async getContacts(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Contact>> {
    return this.query<Contact>('contacts', options);
  }

  async getOpportunities(options?: Parameters<typeof this.query>[1]): Promise<DataverseResponse<Opportunity>> {
    return this.query<Opportunity>('opportunities', options);
  }

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

// Singleton instance - uses demo or real client based on env
let dataverseClient: DataverseClient | DemoDataverseClient | null = null;

export function getDataverseClient(): DataverseClient | DemoDataverseClient {
  if (!dataverseClient) {
    if (process.env.DEMO_MODE === 'true') {
      console.log('📊 Running in DEMO MODE with mock Dataverse data');
      dataverseClient = new DemoDataverseClient();
    } else {
      dataverseClient = new DataverseClient();
    }
  }
  return dataverseClient;
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

export { DataverseClient, DemoDataverseClient };
