import Grid from '@mui/material/Grid'
import TestimonialDetail from '@/views/pages/website-settings/testimonial/TestimonialDetail'

const UserViewTab = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TestimonialDetail />
            </Grid>
        </Grid>
    )
}

export default UserViewTab
