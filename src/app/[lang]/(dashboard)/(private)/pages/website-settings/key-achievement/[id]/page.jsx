import Grid from '@mui/material/Grid';
import Achievementdetail from '@/views/pages/website-settings/key-achievements/Achievementdetail';

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Achievementdetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab

