import Grid from '@mui/material/Grid';
import PaymentDetail from '@/views/pages/configure-subscription/PaymentDetails';

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PaymentDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab
