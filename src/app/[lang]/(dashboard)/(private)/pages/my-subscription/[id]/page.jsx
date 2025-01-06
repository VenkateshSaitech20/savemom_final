import PlanDetail from '@/views/pages/my-subscription/PlanDetail'
import Grid from '@mui/material/Grid'

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
