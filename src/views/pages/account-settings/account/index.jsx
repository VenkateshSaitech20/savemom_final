import Grid from '@mui/material/Grid';
import AccountDetails from './AccountDetails';

const Account = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AccountDetails />
      </Grid>
    </Grid>
  )
}

export default Account
