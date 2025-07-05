# Notifications & Templates Integration

## Overview
The BidBuilder application now has integrated notifications API and enhanced template functionality that allows users to create proposals directly from templates.

## Notifications API Integration

### Backend Endpoint
- **GET** `/notifications` - Fetch user notifications (requires authentication)

### Frontend Integration
- **Real-time Fetching**: Notifications are automatically fetched when the notification bell is clicked
- **Loading States**: Shows loading spinner while fetching notifications
- **Error Handling**: Graceful error handling for failed API calls
- **Mark as Read**: Users can mark individual notifications as read

### Features
- ✅ **API Integration**: Fetches notifications from `http://localhost:8000/notifications`
- ✅ **Loading States**: Visual feedback during API calls
- ✅ **Error Handling**: Displays error messages if API fails
- ✅ **Unread Count**: Shows unread notification count in header
- ✅ **Sample Data**: Backend includes sample notifications for testing

### Sample Notifications
The backend automatically creates sample notifications including:
- Proposal approval notifications
- Comment notifications
- Deadline reminders
- Template updates

## Template-to-Proposal Integration

### Enhanced Template Usage
When a user clicks "Use Template" on any template:

1. **Template Data Pre-fills Form**: 
   - Template name becomes proposal title
   - Template description becomes proposal description
   - Template sections become requirements
   - Template estimated value becomes proposal value
   - Template timeline becomes proposal timeline

2. **Visual Indicators**:
   - Badge shows "Using template: [Template Name]"
   - Form fields are pre-populated with template data
   - Users can still modify all fields

### Implementation Details

#### Template Selection Flow:
1. User clicks "Use Template" button
2. Template data is passed to ProposalForm component
3. Form is pre-populated with template information
4. User can modify and submit the proposal

#### Form Pre-population:
```javascript
const [formData, setFormData] = useState({
  title: proposal?.title || template?.name || "",
  description: proposal?.description || template?.description || "",
  value: proposal?.value || template?.estimatedValue || "",
  timeline: proposal?.timeline || template?.timeline || "",
  requirements: proposal?.requirements || template?.sections || [],
})
```

## API Endpoints

### Notifications
```
GET /notifications
Headers: Authorization: Bearer <token>
Response: Array of notification objects
```

### Templates
```
GET /templates
Headers: Authorization: Bearer <token>
Response: Array of template objects
```

## Usage Examples

### Fetching Notifications
```javascript
import { fetchNotifications } from '../lib/features/notificationsSlice'

// In component
useEffect(() => {
  dispatch(fetchNotifications())
}, [dispatch])
```

### Using Template for Proposal
```javascript
// In ProposalTemplates component
const handleUseTemplate = (template) => {
  setSelectedTemplate(template)
  setCurrentView("create")
}

// In ProposalForm component
const [formData, setFormData] = useState({
  title: template?.name || "",
  description: template?.description || "",
  // ... other fields
})
```

## Testing

### Notifications
1. Start the backend server
2. Login to the application
3. Click the notification bell icon
4. Verify notifications are loaded from API
5. Test marking notifications as read

### Templates
1. Navigate to Templates page
2. Click "Use Template" on any template
3. Verify form is pre-populated with template data
4. Submit the proposal
5. Verify proposal is created with template data

## Benefits

### Notifications Integration
- **Real-time Updates**: Users get immediate feedback on their proposals
- **Better UX**: Clear notification system keeps users informed
- **API-driven**: Dynamic content from backend

### Template Integration
- **Faster Creation**: Pre-filled forms save time
- **Consistency**: Ensures proposals follow template structure
- **Flexibility**: Users can still customize all fields
- **Visual Feedback**: Clear indication when using a template

## Future Enhancements

### Notifications
- Real-time notifications using WebSockets
- Notification preferences
- Email notifications
- Push notifications

### Templates
- Template categories and filtering
- Template versioning
- Template sharing between users
- Template analytics and usage tracking 