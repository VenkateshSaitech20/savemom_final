import Grid from '@mui/material/Grid'
import SMSTemplateDetail from '@views/apps/sms/template/SMSTemplateDetail'

const SMSTemplateViewPage = async () => {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <SMSTemplateDetail />
            </Grid>
        </Grid>
    )
}

export default SMSTemplateViewPage
