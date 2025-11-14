import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const ContactGrid = ({ 
  contacts, 
  onContactSelect,
  onDeleteContact 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never contacted';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (contacts?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Users" size={24} className="text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">No Contacts Found</h3>
        <p className="text-text-secondary">Try adjusting your search or filters, or add a new contact.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4">
      {contacts?.map(contact => (
        <div
          key={contact?.id}
          className="bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden min-h-touch"
          onClick={() => onContactSelect?.(contact)}
        >
          {/* Card Header */}
          <div className="relative p-4 xs:p-6 pb-3 xs:pb-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-750">
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e?.stopPropagation();
                if (window.confirm('Are you sure you want to delete this contact?')) {
                  onDeleteContact?.(contact?.id);
                }
              }}
              className="absolute top-2 right-2 xs:top-3 xs:right-3 p-2 min-h-touch min-w-touch flex items-center justify-center rounded-lg bg-surface/80 backdrop-blur-sm text-text-tertiary hover:text-error hover:bg-error-50 dark:hover:bg-error-900/50 transition-all duration-150 opacity-100 xs:opacity-0 group-hover:opacity-100"
              title="Delete contact"
              aria-label="Delete contact"
            >
              <Icon name="Trash2" size={16} />
            </button>

            {/* Avatar */}
            <div className="flex justify-center mb-2 xs:mb-3">
              <div className="relative">
                <Image
                  src={contact?.avatar_url || '/assets/images/no_image.png'}
                  alt={`${contact?.first_name || ''} ${contact?.last_name || ''}`}
                  className="w-16 h-16 xs:w-20 xs:h-20 rounded-full object-cover border-4 border-surface shadow-md"
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 xs:w-4 xs:h-4 rounded-full border-2 border-surface ${
                  contact?.status === 'active' ? 'bg-success' : 'bg-text-tertiary'
                }`}></span>
              </div>
            </div>

            {/* Name */}
            <h3 className="text-center text-base xs:text-lg font-semibold text-gray-900 dark:text-white truncate px-2">
              {contact?.full_name || `${contact?.first_name || ''} ${contact?.last_name || ''}`?.trim() || 'Unnamed Contact'}
            </h3>
          </div>

          {/* Card Body */}
          <div className="p-3 xs:p-4 space-y-2 xs:space-y-3">
            {/* Company */}
            {contact?.company?.name && (
              <div className="flex items-center space-x-2">
                <Icon name="Briefcase" size={14} className="text-text-tertiary flex-shrink-0" />
                {contact?.company_id ? (
                  <Link
                    to={`/company-management/${contact.company_id}`}
                    className="text-sm text-primary hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {contact.company.name}
                  </Link>
                ) : (
                  <span className="text-sm text-text-secondary truncate">
                    {contact.company.name}
                  </span>
                )}
              </div>
            )}

            {/* Email */}
            {contact?.email && (
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={14} className="text-text-tertiary flex-shrink-0" />
                <span className="text-sm text-text-secondary truncate">
                  {contact?.email}
                </span>
              </div>
            )}

            {/* Phone */}
            {contact?.phone && (
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={14} className="text-text-tertiary flex-shrink-0" />
                <span className="text-sm text-text-secondary truncate">
                  {contact?.phone}
                </span>
              </div>
            )}

            {/* Last Contact Date */}
            <div className="flex items-center space-x-2 pt-2 border-t border-border">
              <Icon name="Clock" size={14} className="text-text-tertiary flex-shrink-0" />
              <span className="text-xs text-text-tertiary truncate">
                {formatDate(contact?.last_contact_date)}
              </span>
            </div>

            {/* Active Deals Indicator */}
            {contact?.deals?.some(deal => deal?.stage === 'negotiation' || deal?.stage === 'proposal') && (
              <div className="flex items-center space-x-2 pt-1">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-xs text-warning font-medium">Has active deals</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactGrid;
