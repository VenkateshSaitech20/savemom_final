'use client'
import Grid from '@mui/material/Grid';
import WhatsAppTemplateTable from './WhatsAppTemplateTable';
import SubUserPermission from '@/utils/SubUserPermission';

const WhatsAppTemplate = () => {
    const { whatsAppPermission } = SubUserPermission();
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <WhatsAppTemplateTable whatsAppPermission={whatsAppPermission} />
            </Grid>
        </Grid>
    )
}

export default WhatsAppTemplate
