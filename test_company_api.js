// Test script to check if API returns company data
import { contactsService } from './frontend/src/services/contactsService.js';

console.log('Testing contacts API...');

// Simulate an API call
async function testContactsAPI() {
  try {
    console.log('Making API call to get contacts...');
    
    // This would normally call the actual API
    // For now, let's just log what should happen
    console.log('API should return contacts with company data like:');
    console.log(JSON.stringify({
      id: "uuid",
      first_name: "John",
      last_name: "Doe", 
      email: "john@example.com",
      company: {
        id: "company-uuid",
        name: "Test Company Inc.",
        industry: null
      }
    }, null, 2));
    
    console.log('✅ If company field is present, the fix worked!');
    console.log('❌ If company field is missing, there might be other issues');
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testContactsAPI();