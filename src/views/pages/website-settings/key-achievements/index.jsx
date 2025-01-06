'use client'
import Grid from '@mui/material/Grid';
//import TestimonialSection from './TestimonialSection';
import AchievementTable from './AchievementTable';
import SubUserPermission from '@/utils/SubUserPermission';

const KeyAchievements = () => {

    const { websiteSettingsPermission } = SubUserPermission();

    return (
        <Grid container spacing={6}>
            
            <Grid item xs={12}>
                <AchievementTable websiteSettingsPermission={websiteSettingsPermission} />
            </Grid>
        </Grid>
    )
}

export default KeyAchievements
