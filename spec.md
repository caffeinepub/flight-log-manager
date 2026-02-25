# Flight Log Manager

## Current State

The Flight Log Manager application currently has basic CRUD operations for:
- **Students**: Only stores name
- **Instructors**: Only stores name  
- **Aircraft**: Only stores registration number
- **Exercises**: Only stores name

All entities have minimal data fields, which limits tracking capabilities for a comprehensive flight school management system.

## Requested Changes (Diff)

### Add
- **Student fields**: License number, medical certificate expiry date, total flight hours, phone number, email
- **Instructor fields**: Certificate number, rating/qualifications, phone number, email
- **Aircraft fields**: Make/model, total airframe hours, last maintenance date, hourly rate
- **Exercise fields**: Description, estimated duration, difficulty level

### Modify
- Backend data types to include new fields for all entities
- Frontend pages to display and edit new fields in forms and tables
- Form dialogs to include input fields for all new data
- Table views to show relevant new fields with responsive design

### Remove
- None (all existing functionality will be preserved)

## Implementation Plan

1. **Backend Updates**:
   - Modify Student, Instructor, Aircraft, and Exercise types to include new fields
   - Update all CRUD functions to handle new fields
   - Maintain backward compatibility with existing data

2. **Frontend Updates**:
   - Expand add/edit dialogs with new form fields
   - Update table displays to show relevant new information
   - Add responsive column handling for smaller screens
   - Include validation for email, phone, and date fields

3. **Data Migration**:
   - Ensure existing records work with new optional fields
   - Use default/empty values for new fields on existing data

## UX Notes

- New fields will be displayed in expandable table rows or detail views to avoid clutter
- Forms will have clear labels and placeholders for all new fields
- Some fields will be optional to allow flexibility
- Date fields will use date pickers for better user experience
- Phone and email fields will have format validation
