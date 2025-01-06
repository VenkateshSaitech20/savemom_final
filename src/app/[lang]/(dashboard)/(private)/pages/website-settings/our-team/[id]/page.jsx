import Grid from '@mui/material/Grid';
import TeamDetail from '@/views/pages/website-settings/our-team/TeamDetail';

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TeamDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab
