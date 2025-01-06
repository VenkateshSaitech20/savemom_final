'use client'
import Grid from '@mui/material/Grid';
import TemplateTable from './TemplateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const VoiceCallTemplate = () => {
    const { voiceCallPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TemplateTable voiceCallPermission={voiceCallPermission} />
            </Grid>
        </Grid>
    )
}

export default VoiceCallTemplate
