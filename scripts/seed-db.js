const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise-dashboard';

// Mock data from dataverse.ts
const accounts = [
  { accountid: '1', name: 'Contoso Ltd', revenue: 5200000, numberofemployees: 250, telephone1: '+49 69 1234567', emailaddress1: 'contact@contoso.de', websiteurl: 'https://contoso.com', address1_city: 'Frankfurt' },
  { accountid: '2', name: 'Fabrikam GmbH', revenue: 3800000, numberofemployees: 180, telephone1: '+49 89 9876543', emailaddress1: 'info@fabrikam.de', websiteurl: 'https://fabrikam.de', address1_city: 'Munich' },
  { accountid: '3', name: 'Adventure Works', revenue: 2900000, numberofemployees: 120, telephone1: '+49 30 5551234', emailaddress1: 'sales@adventureworks.de', websiteurl: 'https://adventureworks.com', address1_city: 'Berlin' },
  { accountid: '4', name: 'Northwind Traders', revenue: 2100000, numberofemployees: 85, telephone1: '+49 40 7778899', emailaddress1: 'trade@northwind.de', websiteurl: 'https://northwind.com', address1_city: 'Hamburg' },
  { accountid: '5', name: 'Tailspin Toys', revenue: 1500000, numberofemployees: 65, telephone1: '+49 711 4443322', emailaddress1: 'toys@tailspin.de', websiteurl: 'https://tailspintoys.com', address1_city: 'Stuttgart' },
  { accountid: '6', name: 'Blue Yonder Airlines', revenue: 8500000, numberofemployees: 520, telephone1: '+49 69 8887766', emailaddress1: 'fly@blueyonder.de', websiteurl: 'https://blueyonder.com', address1_city: 'Frankfurt' },
  { accountid: '7', name: 'Coho Vineyard', revenue: 950000, numberofemployees: 45, telephone1: '+49 6131 2223344', emailaddress1: 'wine@coho.de', websiteurl: 'https://cohovineyard.com', address1_city: 'Mainz' },
  { accountid: '8', name: 'Litware Inc', revenue: 4200000, numberofemployees: 200, telephone1: '+49 211 9998877', emailaddress1: 'info@litware.de', websiteurl: 'https://litware.com', address1_city: 'Düsseldorf' },
];

const contacts = [
  { contactid: '1', firstname: 'Anna', lastname: 'Schmidt', fullname: 'Anna Schmidt', emailaddress1: 'anna.schmidt@contoso.de', telephone1: '+49 69 1234567', jobtitle: 'CEO', _parentcustomerid_value: '1' },
  { contactid: '2', firstname: 'Max', lastname: 'Mueller', fullname: 'Max Mueller', emailaddress1: 'max.mueller@fabrikam.de', telephone1: '+49 89 9876543', jobtitle: 'CTO', _parentcustomerid_value: '2' },
  { contactid: '3', firstname: 'Sophie', lastname: 'Weber', fullname: 'Sophie Weber', emailaddress1: 'sophie.weber@adventureworks.de', telephone1: '+49 30 5551234', jobtitle: 'Sales Director', _parentcustomerid_value: '3' },
  { contactid: '4', firstname: 'Lukas', lastname: 'Fischer', fullname: 'Lukas Fischer', emailaddress1: 'lukas.fischer@northwind.de', telephone1: '+49 40 7778899', jobtitle: 'Account Manager', _parentcustomerid_value: '4' },
  { contactid: '5', firstname: 'Emma', lastname: 'Wagner', fullname: 'Emma Wagner', emailaddress1: 'emma.wagner@tailspin.de', telephone1: '+49 711 4443322', jobtitle: 'Marketing Lead', _parentcustomerid_value: '5' },
  { contactid: '6', firstname: 'Leon', lastname: 'Becker', fullname: 'Leon Becker', emailaddress1: 'leon.becker@blueyonder.de', telephone1: '+49 69 8887766', jobtitle: 'VP Operations', _parentcustomerid_value: '6' },
  { contactid: '7', firstname: 'Mia', lastname: 'Hoffmann', fullname: 'Mia Hoffmann', emailaddress1: 'mia.hoffmann@coho.de', telephone1: '+49 6131 2223344', jobtitle: 'Owner', _parentcustomerid_value: '7' },
  { contactid: '8', firstname: 'Felix', lastname: 'Koch', fullname: 'Felix Koch', emailaddress1: 'felix.koch@litware.de', telephone1: '+49 211 9998877', jobtitle: 'CFO', _parentcustomerid_value: '8' },
  { contactid: '9', firstname: 'Hannah', lastname: 'Richter', fullname: 'Hannah Richter', emailaddress1: 'hannah.richter@contoso.de', telephone1: '+49 69 1234568', jobtitle: 'Developer', _parentcustomerid_value: '1' },
  { contactid: '10', firstname: 'Paul', lastname: 'Klein', fullname: 'Paul Klein', emailaddress1: 'paul.klein@fabrikam.de', telephone1: '+49 89 9876544', jobtitle: 'Project Manager', _parentcustomerid_value: '2' },
];

const opportunities = [
  { opportunityid: '1', name: 'Contoso ERP Implementation', estimatedvalue: 450000, statecode: 0, estimatedclosedate: '2026-04-15', _parentaccountid_value: '1' },
  { opportunityid: '2', name: 'Fabrikam Cloud Migration', estimatedvalue: 320000, statecode: 0, estimatedclosedate: '2026-05-01', _parentaccountid_value: '2' },
  { opportunityid: '3', name: 'Adventure Works CRM', estimatedvalue: 180000, statecode: 1, estimatedclosedate: '2025-11-30', _parentaccountid_value: '3' },
  { opportunityid: '4', name: 'Northwind Supply Chain', estimatedvalue: 95000, statecode: 1, estimatedclosedate: '2026-01-15', _parentaccountid_value: '4' },
  { opportunityid: '5', name: 'Tailspin E-commerce', estimatedvalue: 220000, statecode: 0, estimatedclosedate: '2026-06-30', _parentaccountid_value: '5' },
  { opportunityid: '6', name: 'Blue Yonder Booking System', estimatedvalue: 750000, statecode: 0, estimatedclosedate: '2026-07-15', _parentaccountid_value: '6' },
  { opportunityid: '7', name: 'Coho Wine Tracking', estimatedvalue: 45000, statecode: 2, estimatedclosedate: '2025-10-01', _parentaccountid_value: '7' },
  { opportunityid: '8', name: 'Litware Analytics Platform', estimatedvalue: 380000, statecode: 1, estimatedclosedate: '2026-02-28', _parentaccountid_value: '8' },
  { opportunityid: '9', name: 'Contoso Mobile App', estimatedvalue: 180000, statecode: 1, estimatedclosedate: '2025-12-01', _parentaccountid_value: '1' },
  { opportunityid: '10', name: 'Fabrikam IoT Integration', estimatedvalue: 280000, statecode: 0, estimatedclosedate: '2026-08-15', _parentaccountid_value: '2' },
  { opportunityid: '11', name: 'Blue Yonder Loyalty Program', estimatedvalue: 520000, statecode: 2, estimatedclosedate: '2025-09-15', _parentaccountid_value: '6' },
  { opportunityid: '12', name: 'Litware Security Upgrade', estimatedvalue: 200000, statecode: 1, estimatedclosedate: '2025-12-20', _parentaccountid_value: '8' },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('enterprise-dashboard');
    
    // Clear existing data
    await db.collection('accounts').deleteMany({});
    await db.collection('contacts').deleteMany({});
    await db.collection('opportunities').deleteMany({});
    
    // Insert new data
    await db.collection('accounts').insertMany(accounts);
    console.log(`✅ Inserted ${accounts.length} accounts`);
    
    await db.collection('contacts').insertMany(contacts);
    console.log(`✅ Inserted ${contacts.length} contacts`);
    
    await db.collection('opportunities').insertMany(opportunities);
    console.log(`✅ Inserted ${opportunities.length} opportunities`);
    
    console.log('\n🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
