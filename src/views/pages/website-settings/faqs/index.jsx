'use client'
import Grid from '@mui/material/Grid';
import FaqSection from './FaqSection';
import FaqTable from './FaqTable';
import SubUserPermission from '@/utils/SubUserPermission';

const Faq= () => {

    const { websiteSettingsPermission } = SubUserPermission();

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <FaqSection />
            </Grid>
            <Grid item xs={12}>
                <FaqTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default Faq
