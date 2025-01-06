'use client'
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import RolesTable from './RolesTable';
const Roles = () => {
  const { manageRolesPermission } = SubUserPermission();
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <RolesTable manageRolesPermission={manageRolesPermission} />
      </Grid>
    </Grid>
  )
}
export default Roles
