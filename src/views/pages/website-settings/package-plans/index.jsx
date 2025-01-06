'use client'
import Grid from '@mui/material/Grid';
import PlansSection from './PlansSection';

const Plan = () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <PlansSection />
            </Grid>

        </Grid>
    )
}

export default Plan
