import Grid from '@mui/material/Grid';
import BrandDetail from '@/views/pages/website-settings/brand/BrandDetail';

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <BrandDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab


