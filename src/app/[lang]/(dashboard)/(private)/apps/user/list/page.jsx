// Component Imports
import UserList from '@views/apps/user/list'

// Data Imports
// import { getUserData } from '@/app/server/actions'
// import { getSession } from 'next-auth/react'
// import axios from 'axios'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
// const getUserData = async (id) => {
//   try {
//     const response = await axios.post('/api/sub-user/get-by-users-id', { createdBy: id });
//     if (response.data.result === true) {
//       return response.data.message;
//     } else {
//       throw new Error('Failed to fetch data');
//     }
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     throw error;
//   }
// }

const UserListApp = async () => {
  // const data = await getUserData();

  return <UserList />
}

export default UserListApp
