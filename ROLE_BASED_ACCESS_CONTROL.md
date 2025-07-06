# Role-Based Access Control & Proposal Assignment

## Overview
This document describes the implementation of role-based access control (RBAC) and proposal assignment features in the BidBuilder application. The system now supports three user roles with different permissions and capabilities.

## User Roles

### 1. User (Regular User)
- **Permissions:**
  - ✅ View proposals
  - ✅ Edit proposals (if owner or assigned)
  - ✅ Update proposal status
  - ✅ Submit proposals back to manager
  - ❌ Create new proposals
  - ❌ Create templates
  - ❌ Assign proposals to other users

### 2. Manager
- **Permissions:**
  - ✅ All user permissions
  - ✅ Create new proposals
  - ✅ Create templates
  - ✅ Assign proposals to users
  - ✅ Update proposal status
  - ❌ Administrative functions

### 3. Administrator
- **Permissions:**
  - ✅ All manager permissions
  - ✅ Full system access
  - ✅ Administrative functions

## Role-Based Access Control Implementation

### 1. Role Utilities (`frontend/src/lib/roleUtils.js`)

**Core Functions:**
```javascript
// Get user role from localStorage
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.role || null
}

// Check specific permissions
export const canCreateProposals = () => {
  return hasAnyRole(['manager', 'admin'])
}

export const canCreateTemplates = () => {
  return hasAnyRole(['manager', 'admin'])
}

export const canAssignProposals = () => {
  return hasAnyRole(['manager', 'admin'])
}

export const canEditProposals = () => {
  const userRole = getUserRole()
  return userRole && ['user', 'manager', 'admin'].includes(userRole)
}

export const canUpdateProposalStatus = () => {
  const userRole = getUserRole()
  return userRole && ['user', 'manager', 'admin'].includes(userRole)
}

export const canSubmitBackToManager = () => {
  return hasRole('user')
}
```

### 2. API Integration

**New API Endpoints Added:**

1. **Get All Users** (`GET /manager/users`)
   - Returns list of all users for assignment
   - Used by managers and admins

2. **Assign Proposal to User** (`POST /proposals/assign_to_user`)
   ```json
   {
     "proposal_id": 0,
     "user_id": 0
   }
   ```

3. **Update Proposal Status** (`PUT /proposals/status`)
   ```json
   {
     "proposal_id": 0,
     "status": "string"
   }
   ```

4. **Submit Back to Manager** (`POST /proposals/submit_back_to_manager?proposal_id=1`)

## UI Components

### 1. AssignTeamMemberModal Component

**Features:**
- ✅ Loads all users from API
- ✅ Displays user roles with color-coded badges
- ✅ Shows proposal details
- ✅ Validates assignment
- ✅ Loading states and error handling

**Usage:**
```javascript
<AssignTeamMemberModal
  proposal={currentProposal}
  onClose={() => setShowAssignModal(false)}
  onSuccess={handleAssignSuccess}
/>
```

### 2. Updated ProposalDetails Component

**New Features:**
- ✅ Role-based action buttons
- ✅ Status update dropdown (all users)
- ✅ Assign team member button (managers/admins)
- ✅ Submit back to manager button (users only)
- ✅ User role display

**Quick Actions Section:**
```javascript
{/* Assign Team Member - Only for managers and admins */}
{canAssignProposals() && (
  <Button onClick={() => setShowAssignModal(true)}>
    <Users className="h-4 w-4 mr-2" />
    Assign Team Member
  </Button>
)}

{/* Status Update - For all authenticated users */}
{canUpdateProposalStatus() && (
  <Select value={currentProposal.status} onValueChange={handleStatusUpdate}>
    <SelectContent>
      <SelectItem value="Draft">Draft</SelectItem>
      <SelectItem value="Under Review">Under Review</SelectItem>
      <SelectItem value="Approved">Approved</SelectItem>
      <SelectItem value="Rejected">Rejected</SelectItem>
    </SelectContent>
  </Select>
)}

{/* Submit Back to Manager - Only for users */}
{canSubmitBackToManager() && currentProposal.status === "Under Review" && (
  <Button onClick={handleSubmitBackToManager}>
    <Send className="h-4 w-4 mr-2" />
    Submit Back to Manager
  </Button>
)}
```

### 3. Updated EnhancedHeader Component

**Role-Based Navigation:**
- ✅ Create Proposal button only for managers/admins
- ✅ Mobile menu respects role permissions
- ✅ User role display in profile menu

### 4. Updated ProposalTemplates Component

**Role-Based Features:**
- ✅ Create Template button only for managers/admins
- ✅ All users can view and use templates

## Workflow Examples

### 1. Manager Assigning Proposal to User
1. Manager views proposal details
2. Clicks "Assign Team Member" button
3. Modal opens with user list
4. Manager selects user from dropdown
5. Clicks "Assign Proposal"
6. Proposal is assigned and page refreshes

### 2. User Working on Assigned Proposal
1. User views assigned proposal
2. Updates proposal content
3. Changes status to "Under Review"
4. Clicks "Submit Back to Manager"
5. Proposal is submitted for manager review

### 3. Status Update Workflow
1. Any authenticated user can update proposal status
2. Status dropdown shows current status
3. User selects new status
4. API call updates status
5. Page refreshes with new status

## Error Handling

### 1. Permission Denied
- Alert messages for unauthorized actions
- Buttons hidden for users without permissions
- Graceful fallbacks for missing permissions

### 2. API Errors
- User-friendly error messages
- Loading states during API calls
- Retry mechanisms for failed operations

### 3. Validation
- Form validation for required fields
- File type validation for uploads
- Role-based validation for actions

## Security Considerations

### 1. Frontend Security
- Role checks on all protected actions
- Hidden UI elements for unauthorized users
- Client-side validation for user experience

### 2. API Security
- Authentication headers on all requests
- Role-based endpoint access
- Server-side validation of permissions

### 3. Data Protection
- User data only accessible to authorized roles
- Assignment tracking for audit trails
- Status change logging

## Future Enhancements

### 1. Advanced Permissions
- Custom role creation
- Granular permission settings
- Department-based access control

### 2. Workflow Automation
- Automatic status transitions
- Email notifications for assignments
- Approval workflows

### 3. Audit Trail
- Complete action logging
- User activity tracking
- Change history for proposals

## Testing Scenarios

### 1. Role-Based Access
- [ ] User cannot create proposals
- [ ] Manager can assign proposals
- [ ] Admin has full access
- [ ] UI elements hidden appropriately

### 2. Proposal Assignment
- [ ] Manager can assign to any user
- [ ] Assignment updates proposal data
- [ ] Assigned user can edit proposal
- [ ] Assignment history tracked

### 3. Status Updates
- [ ] All users can update status
- [ ] Status changes are saved
- [ ] Progress tracker updates
- [ ] Status validation works

### 4. Submit Back to Manager
- [ ] Only users can submit back
- [ ] Only works for "Under Review" status
- [ ] Submission updates proposal
- [ ] Manager receives notification 