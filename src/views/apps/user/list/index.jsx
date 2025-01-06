"use client";
import Grid from '@mui/material/Grid';
import UserListTable from './UserListTable';
import SubUserPermission from '@/utils/SubUserPermission';
// import GetMenuPath from '@/utils/GetMenuPath';

const UserList = () => {
  const { manageUsersPermission } = SubUserPermission();
  // const { doesPathExist } = GetMenuPath();
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {/* {doesPathExist && <UserListTable manageUsersPermission={manageUsersPermission} />} */}
        <UserListTable manageUsersPermission={manageUsersPermission} />
      </Grid>
    </Grid>
  )
}

export default UserList
