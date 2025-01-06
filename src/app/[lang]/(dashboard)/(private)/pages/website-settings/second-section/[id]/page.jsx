import Grid from '@mui/material/Grid'
import FeatureDetail from '@/views/pages/website-settings/second-section/FeatureDetail'

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <FeatureDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab
