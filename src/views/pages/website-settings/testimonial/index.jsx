'use client'
import Grid from '@mui/material/Grid';
import TestimonialSection from './TestimonialSection';
import TestimonialTable from './TestimonialTable';
import SubUserPermission from '@/utils/SubUserPermission';

const Testimonial = () => {

    const { websiteSettingsPermission } = SubUserPermission();

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TestimonialSection />
            </Grid>
            <Grid item xs={12}>
                <TestimonialTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default Testimonial
