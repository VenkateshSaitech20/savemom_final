'use client'
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import FeatureSection from './FeatureSection';
import FeatureTable from './FeatureTable';
const SecondSection = () => {
    const { websiteSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <FeatureSection />
            </Grid>
            <Grid item xs={12}>
                <FeatureTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default SecondSection
