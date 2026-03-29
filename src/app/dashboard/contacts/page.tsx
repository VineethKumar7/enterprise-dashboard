'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import { Contact, ApiResponse } from '@/types';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchContacts = useCallback(async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/dataverse/contacts?limit=20&offset=${(page - 1) * 20}`);
      const data: ApiResponse<Contact[]> = await response.json();

      if (data.success && data.data) {
        setContacts(data.data);
        if (data.pagination) {
          setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages });
        }
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading contacts..." />
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Contacts" 
        onRefresh={() => fetchContacts(pagination.page, true)}
        isRefreshing={refreshing}
      />
      
      <div className="p-6">
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchContacts()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr key={contact.contactid} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{contact.fullname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.emailaddress1 ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{contact.emailaddress1}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {contact.telephone1 ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{contact.telephone1}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {contact.jobtitle ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4" />
                            <span>{contact.jobtitle}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => fetchContacts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchContacts(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
