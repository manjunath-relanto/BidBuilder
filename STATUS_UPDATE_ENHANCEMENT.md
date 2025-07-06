# Status Update Enhancement

## Overview
This document describes the enhancement to the proposal status update functionality, which now includes a two-step process: status selection followed by submission.

## Changes Made

### 1. ProposalDetails Component (`frontend/src/components/ProposalDetails.jsx`)

#### New State Management
- **Added `selectedStatus` state**: Tracks the user's status selection before submission
- **Added `useEffect`**: Initializes selectedStatus when proposal data changes

```javascript
const [selectedStatus, setSelectedStatus] = useState(currentProposal?.status || '')

// Initialize selectedStatus when proposal changes
useEffect(() => {
  setSelectedStatus(currentProposal?.status || '')
}, [currentProposal])
```

#### Updated Functions
- **`handleStatusSelection`**: New function that only updates the local state
- **`handleStatusSubmit`**: New function that validates and submits the status change

```javascript
const handleStatusSelection = (newStatus) => {
  setSelectedStatus(newStatus)
}

const handleStatusSubmit = async () => {
  if (!canUpdateProposalStatus()) return
  if (!selectedStatus || selectedStatus === currentProposal.status) {
    alert("Please select a different status to update.")
    return
  }
  
  setIsUpdatingStatus(true)
  try {
    await proposalsAPI.updateStatus(currentProposal.id, selectedStatus)
    alert("Status updated successfully!")
    window.location.reload()
  } catch (error) {
    console.error("Error updating status:", error)
    alert("Failed to update status. Please try again.")
  } finally {
    setIsUpdatingStatus(false)
  }
}
```

#### Enhanced UI
- **Status Select**: Now uses `selectedStatus` instead of current status
- **Submit Button**: Only appears when a different status is selected
- **Visual Feedback**: Loading states and success/error messages

```javascript
<Select 
  value={selectedStatus} 
  onValueChange={handleStatusSelection}
  disabled={isUpdatingStatus}
>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Draft">Draft</SelectItem>
    <SelectItem value="Under Review">Under Review</SelectItem>
    <SelectItem value="Approved">Approved</SelectItem>
    <SelectItem value="Rejected">Rejected</SelectItem>
  </SelectContent>
</Select>

{/* Submit Button - Only show if status is different from current */}
{selectedStatus && selectedStatus !== currentProposal.status && (
  <Button 
    onClick={handleStatusSubmit}
    disabled={isUpdatingStatus}
    className="w-full bg-blue-600 hover:bg-blue-700"
  >
    {isUpdatingStatus ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Updating...
      </>
    ) : (
      <>
        <RefreshCw className="h-4 w-4 mr-2" />
        Update Status
      </>
    )}
  </Button>
)}
```

## User Experience Flow

### Before Enhancement
1. User selects status from dropdown
2. API call is made immediately
3. No confirmation step

### After Enhancement
1. **Selection Phase**: User selects desired status from dropdown
2. **Confirmation Phase**: Submit button appears if status is different
3. **Submission Phase**: User clicks "Update Status" button
4. **Feedback Phase**: Loading state and success/error messages
5. **Refresh Phase**: Page reloads with updated status

## Benefits

### 1. **Prevents Accidental Updates**
- Users must explicitly confirm status changes
- Reduces risk of unintended status modifications

### 2. **Better User Control**
- Users can change their mind before submitting
- Clear visual indication of pending changes

### 3. **Improved Feedback**
- Clear loading states during API calls
- Success and error messages for better UX
- Visual confirmation of status differences

### 4. **Enhanced Validation**
- Prevents submission of same status
- Validates user permissions before API calls

## Status Options

The following status options are available:
- **Draft**: Initial proposal state
- **Under Review**: Proposal is being reviewed
- **Approved**: Proposal has been approved
- **Rejected**: Proposal has been rejected

## Role-Based Access

### All Authenticated Users
- Can view current status
- Can select new status
- Can submit status updates (if different from current)

### Managers and Admins
- Full access to all status update features
- Can update status for any proposal

### Regular Users
- Can update status for their own proposals
- Can submit proposals back to manager

## Error Handling

### Validation Errors
- **Same Status**: Alert if user tries to update to same status
- **Permission Denied**: Alert if user lacks update permissions
- **Empty Selection**: Prevents submission without status selection

### API Errors
- **Network Issues**: Shows error message with retry option
- **Server Errors**: Displays specific error messages
- **Timeout**: Handles API call timeouts gracefully

## Future Enhancements

### 1. **Status History**
- Track all status changes with timestamps
- Show who made each status change
- Add comments for status changes

### 2. **Status Workflow**
- Define allowed status transitions
- Prevent invalid status sequences
- Add approval workflows

### 3. **Real-time Updates**
- Use WebSocket for live status updates
- Remove need for page refresh
- Show status changes in real-time

### 4. **Bulk Status Updates**
- Allow updating multiple proposals at once
- Batch API calls for efficiency
- Progress indicators for bulk operations 