import Grid from '@mui/material/Grid'
import PlanDetail from '@/views/pages/website-settings/package-plans/PlanDetail'

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PlanDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab
