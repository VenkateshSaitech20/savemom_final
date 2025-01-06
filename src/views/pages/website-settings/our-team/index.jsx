'use client'
import Grid from '@mui/material/Grid';
import SubUserPermission from '@/utils/SubUserPermission';
import TeamSection from './TeamSection';
import TeamTable from './TeamTable';
const OurTeam = () => {
    const { websiteSettingsPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TeamSection />
            </Grid>
            <Grid item xs={12}>
                <TeamTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default OurTeam
