import Grid from '@mui/material/Grid';
import FaqDetail from '@/views/pages/website-settings/faqs/FaqDetail';

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <FaqDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab

