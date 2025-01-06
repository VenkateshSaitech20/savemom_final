import { useState, useEffect } from 'react';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextFieldStyled from '@core/components/mui/TextField';
import { signOut } from 'next-auth/react';
import apiClient from '@/utils/apiClient';

const TableFilters = ({ setData, tableData }) => {
  // States
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [userRoles, setUserRoles] = useState([]);

  const getUserRole = async () => {
    const response = await apiClient.post('/api/user-role/get-roles-by-user-id', {})
    if (response.data.result === true) {
      setUserRoles(response.data.message)
    } else if (response.data.result === false) {
      if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
        sessionStorage.removeItem("token");
      }
    }
  };

  useEffect(() => {
    getUserRole();
  }, [])

  useEffect(() => {
    const filteredData = tableData?.filter(user => {
      if (role && user.roleName !== role) return false
      // if (plan && user.currentPlan !== plan) return false
      if (status && user.profileStatus.toLowerCase() !== status) return false

      return true
    })

    setData(filteredData || [])
  }, [role, plan, status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <TextFieldStyled
            select
            fullWidth
            id='select-role'
            value={role}
            InputLabelProps={{ shrink: true }}
            variant='filled'
            onChange={e => setRole(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Role</MenuItem>
            {Array.isArray(userRoles) && userRoles?.map((role) => (
              <MenuItem key={role.id} value={role.roleName.toLowerCase()}>{role.roleName}</MenuItem>
            ))}
          </TextFieldStyled>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextFieldStyled
            select
            fullWidth
            id='select-status'
            value={status}
            InputLabelProps={{ shrink: true }}
            variant='filled'
            onChange={e => setStatus(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Select Status</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
          </TextFieldStyled>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
