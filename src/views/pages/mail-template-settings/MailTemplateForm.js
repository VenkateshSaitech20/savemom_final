import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextFieldStyled from '@core/components/mui/TextField';
import CustomInputLabel from '@/components/asterick';
import Loader from '@/components/loader';
import EditorComponent from '@/utils/EditorComponent';
import { registerData } from '@/utils/message';
import PropTypes from 'prop-types';

const MailTemplateForm = ({ onSubmit, register, errors, apiErrors, message, editorRef, isButtonLoading, mailTemplateSettingsPermission }) => (
    <form autoComplete='off' onSubmit={onSubmit}>
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <TextFieldStyled
                    fullWidth
                    variant='filled'
                    size={"small"}
                    InputLabelProps={{ shrink: true }}
                    label={<CustomInputLabel htmlFor='subject' text='Subject' />}
                    placeholder='Subject'
                    inputProps={{ maxLength: 100 }}
                    error={!!errors.subject || apiErrors?.subject}
                    helperText={errors?.subject?.message || apiErrors?.subject}
                    {...register('subject', {
                        required: registerData.subjectReq,
                        validate: value => value.trim() !== '' || registerData.subjectReq,
                    })}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography style={{ marginBottom: '5px' }}>
                    Message <span style={{ color: '#ff4525' }}>*</span>
                </Typography>
                <EditorComponent ref={editorRef} placeholder="Enter message" data={message} />
                {apiErrors?.message && (
                    <div className='plb-3 pli-6'>
                        <Typography variant="body2" color="error" className="mt-1">
                            {apiErrors.message}
                        </Typography>
                    </div>
                )}
            </Grid>

            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                {(mailTemplateSettingsPermission?.editPermission === "Y" ||
                    mailTemplateSettingsPermission?.writePermission === "Y") && (
                        <Button variant='contained' type='submit'>
                            {isButtonLoading ? <Loader type="btnLoader" /> : "Save Changes"}
                        </Button>
                    )}
            </Grid>
        </Grid>
    </form>
);

MailTemplateForm.propTypes = {
    onSubmit: PropTypes.any,
    register: PropTypes.any,
    errors: PropTypes.any,
    apiErrors: PropTypes.any,
    message: PropTypes.any,
    editorRef: PropTypes.any,
    isButtonLoading: PropTypes.any,
    mailTemplateSettingsPermission: PropTypes.any
}

export default MailTemplateForm;
