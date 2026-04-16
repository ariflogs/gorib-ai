# How to Set an Admin User

## Quick Start

To give admin access to a user, you need to add a record to the `user_roles` table in Convex.

### Steps:

1. **Get the User ID**
   - Go to Convex Dashboard: https://dashboard.convex.dev/
   - Navigate to "Data" → "user" table
   - Find the user you want to make admin
   - Copy their `_id` field (something like `"j97abc123def456"`)

2. **Create Admin Role**
   - In Convex Dashboard, go to "Data" → "user_roles" table
   - Click "Add Document"
   - Add the following fields:

   ```json
   {
     "user_id": "PASTE_USER_ID_HERE",
     "role": "admin"
   }
   ```

   - Click "Save"

3. **Verify Admin Access**
   - Log in as that user
   - Navigate to `/admin` in your app
   - You should now see the admin panel

## Admin Panel Features

Once you have admin access, you can:

- **View all users** with their subscription details
- **Create subscriptions** for users (Basic or Pro)
- **Extend subscriptions** by adding more days
- **Cancel subscriptions** immediately
- **Upgrade/downgrade plans** for users

## Admin Panel URL

`https://your-app-url.com/admin`

## Security

- Only users with `role: "admin"` in the `user_roles` table can access the admin panel
- Non-admin users are automatically redirected to the home page
- All admin actions are protected by server-side authentication checks

## Example: Making Yourself Admin

If your user ID is `j97abc123def456`:

```json
{
  "user_id": "j97abc123def456",
  "role": "admin"
}
```

After saving this to the `user_roles` table, you will have full admin access.
