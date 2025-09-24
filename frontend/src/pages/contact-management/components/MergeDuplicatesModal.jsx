import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const MergeDuplicatesModal = ({ contact1, contact2, onMerge, onClose }) => {
  const [mergedContact, setMergedContact] = useState({
    id: Date.now(),
    firstName: contact1?.firstName,
    lastName: contact1?.lastName,
    email: contact1?.email,
    phone: contact1?.phone,
    company: contact1?.company,
    position: contact1?.position,
    avatar: contact1?.avatar,
    lastContactDate: new Date()?.toISOString(),
    status: contact1?.status,
    tags: [...new Set([...contact1.tags, ...contact2.tags])],
    deals: [...contact1?.deals, ...contact2?.deals],
    notes: contact1?.notes && contact2?.notes 
      ? `${contact1?.notes}\n\n${contact2?.notes}`
      : contact1?.notes || contact2?.notes,
    socialProfiles: { ...contact1?.socialProfiles, ...contact2?.socialProfiles },
    activities: [...contact1?.activities, ...contact2?.activities]?.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ),
    customFields: { ...contact1?.customFields }
  });

  const handleFieldSelect = (field, value) => {
    setMergedContact({
      ...mergedContact,
      [field]: value
    });
  };

  const renderFieldComparison = (field, label, contact1Value, contact2Value) => {
    return (
      <div className="py-3 border-b border-border last:border-b-0">
        <div className="text-sm font-medium text-text-secondary mb-2">{label}</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div 
            className={`flex-1 p-3 rounded-lg border ${
              mergedContact?.[field] === contact1Value 
                ? 'border-primary bg-primary-50' :'border-border hover:border-primary-100 cursor-pointer'
            }`}
            onClick={() => handleFieldSelect(field, contact1Value)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                {field === 'avatar' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image src={contact1Value} alt="Contact 1" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-text-primary">{contact1Value || '-'}</span>
                )}
              </div>
              {mergedContact?.[field] === contact1Value && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </div>
          </div>
          
          <div 
            className={`flex-1 p-3 rounded-lg border ${
              mergedContact?.[field] === contact2Value 
                ? 'border-primary bg-primary-50' :'border-border hover:border-primary-100 cursor-pointer'
            }`}
            onClick={() => handleFieldSelect(field, contact2Value)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                {field === 'avatar' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image src={contact2Value} alt="Contact 2" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-text-primary">{contact2Value || '-'}</span>
                )}
              </div>
              {mergedContact?.[field] === contact2Value && (
                <Icon name="Check" size={16} className="text-primary" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-1100 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text-primary">Merge Duplicate Contacts</h3>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="px-6 py-5">
            <div className="mb-6">
              <p className="text-text-secondary mb-4">
                Select which information to keep for the merged contact.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div></div>
                <div className="text-center text-sm font-medium text-text-primary">Contact 1</div>
                <div className="text-center text-sm font-medium text-text-primary">Contact 2</div>
              </div>
              
              <div className="border border-border rounded-lg divide-y divide-border">
                {renderFieldComparison('avatar', 'Profile Picture', contact1?.avatar, contact2?.avatar)}
                {renderFieldComparison('firstName', 'First Name', contact1?.firstName, contact2?.firstName)}
                {renderFieldComparison('lastName', 'Last Name', contact1?.lastName, contact2?.lastName)}
                {renderFieldComparison('email', 'Email', contact1?.email, contact2?.email)}
                {renderFieldComparison('phone', 'Phone', contact1?.phone, contact2?.phone)}
                {renderFieldComparison('company', 'Company', contact1?.company, contact2?.company)}
                {renderFieldComparison('position', 'Position', contact1?.position, contact2?.position)}
              </div>
              
              <div className="mt-6">
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-primary">
                  <div className="flex items-start">
                    <Icon name="Info" size={16} className="mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Additional Information</p>
                      <p>The following data will be combined from both contacts:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Tags ({mergedContact?.tags?.length} total)</li>
                        <li>Deals ({mergedContact?.deals?.length} total)</li>
                        <li>Activities ({mergedContact?.activities?.length} total)</li>
                        <li>Notes (will be concatenated)</li>
                        <li>Social profiles (will be merged)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-150 ease-out"
            >
              Cancel
            </button>
            <button
              onClick={() => onMerge(mergedContact)}
              className="btn-primary inline-flex items-center"
            >
              <Icon name="GitMerge" size={16} className="mr-2" />
              Merge Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeDuplicatesModal;