import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Updated to use the latest available Gemini model (as of Oct 2025)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

class GeminiService {
  async generateEmailContent(contactInfo, existingSubject = '', existingBody = '') {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      const hasExistingContent = existingSubject.trim() || existingBody.trim();
      
      let prompt;
      
      if (hasExistingContent) {
        prompt = this.createEnhancementPrompt(contactInfo, existingSubject, existingBody);
      } else {
        prompt = this.createTemplatePrompt(contactInfo);
      }


      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );


      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from Gemini API');
      }

      const candidate = response.data.candidates[0];
      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        console.error('Invalid content structure:', candidate);
        throw new Error('Invalid content structure from Gemini API');
      }

      const generatedText = candidate.content.parts[0].text;
      
      const parsedContent = this.parseEmailContent(generatedText);
      
      return parsedContent;
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 400) {
        const errorDetails = error.response.data?.error?.message || 'Invalid request';
        throw new Error(`Invalid request to Gemini API: ${errorDetails}`);
      } else if (error.response?.status === 403) {
        throw new Error('Gemini API key is invalid or has no quota remaining.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests to Gemini API. Please try again later.');
      } else if (error.response?.status === 404) {
        throw new Error('Gemini API endpoint not found. The model may have been updated.');
      } else {
        throw new Error(`Failed to generate email content: ${error.message}`);
      }
    }
  }

  createEnhancementPrompt(contactInfo, existingSubject, existingBody) {
    return `You are a professional email assistant. Please enhance and improve the following email content while maintaining the original intent and message.

Contact Information:
- Name: ${contactInfo?.first_name || ''} ${contactInfo?.last_name || ''}
- Company: ${contactInfo?.company_name || 'their company'}
- Email: ${contactInfo?.email || ''}

Current Email Content:
Subject: "${existingSubject}"
Body: "${existingBody}"

Please enhance this email by:
1. Making the subject line more compelling and professional
2. Improving the body content for clarity, professionalism, and engagement
3. Adding appropriate greetings and closing if missing
4. Ensuring proper business email etiquette
5. Maintaining the original intent and key messages

Respond in this exact JSON format:
{
  "subject": "Enhanced subject line here",
  "body": "Enhanced email body here with proper formatting and professional tone"
}`;
  }

  createTemplatePrompt(contactInfo) {
    return `You are a professional email assistant. Create a professional business email template for a CRM system.

Contact Information:
- Name: ${contactInfo?.first_name || 'the contact'} ${contactInfo?.last_name || ''}
- Company: ${contactInfo?.company_name || 'their company'}
- Email: ${contactInfo?.email || ''}

Please create a professional business email that:
1. Has a compelling and relevant subject line
2. Includes a proper greeting using the contact's name
3. Has a professional introduction or opening
4. Includes a clear purpose/call to action
5. Has an appropriate professional closing
6. Is suitable for business relationship building or follow-up

The tone should be:
- Professional but friendly
- Clear and concise
- Appropriate for business communication
- Personalized using the contact information

Respond in this exact JSON format:
{
  "subject": "Professional subject line here",
  "body": "Complete professional email body here with proper greeting, content, and closing"
}`;
  }

  parseEmailContent(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          subject: parsed.subject || 'Professional Follow-up',
          body: parsed.body || 'Thank you for your time. I look forward to hearing from you soon.'
        };
      }
      
      const subjectMatch = text.match(/["'']?subject["'']?\s*:\s*["'']([^"'']+)["'']/i);
      const bodyMatch = text.match(/["'']?body["'']?\s*:\s*["'']([^"'']+)["'']/i);
      
      return {
        subject: subjectMatch ? subjectMatch[1] : 'Professional Follow-up',
        body: bodyMatch ? bodyMatch[1] : 'Thank you for your time. I look forward to hearing from you soon.'
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        subject: 'Professional Follow-up',
        body: 'Thank you for your time. I look forward to hearing from you soon.'
      };
    }
  }
}

export default new GeminiService();
