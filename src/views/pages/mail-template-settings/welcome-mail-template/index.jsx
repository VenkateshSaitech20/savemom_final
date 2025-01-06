'use client';
import { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Loader from '@/components/loader';
import { useForm } from 'react-hook-form';
import apiClient from '@/utils/apiClient';
import { showToast } from '@/utils/helper';
import SubUserPermission from '@/utils/SubUserPermission';
import MailTemplateForm from '../MailTemplateForm';

const WelcomeMailTemplate = () => {
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [id, setId] = useState('');
    const [message, setMessage] = useState('');
    const { mailTemplateSettingsPermission } = SubUserPermission();

    const editorRef = useRef();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const handleMailTemplateSubmit = async (data) => {
        setApiErrors({});
        setIsButtonLoading(true);
        data.message = editorRef.current?.getHTML();
        if (id) data.id = id;
        data.templateType = "welcome-mail";
        const response = await apiClient.post('/api/mail-template-settings', data);
        if (response.data.result === true) {
            showToast(true, response.data.message);
            setApiErrors({});
            getMailTemplate();
        } else {
            setApiErrors(response.data.message);
        }
        setIsButtonLoading(false);
    };

    const getMailTemplate = async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/mail-template-settings/get-by-template-type', {
            templateType: 'welcome-mail',
        });
        if (response.data.result === true) {
            const data = response.data.message;
            setValue('subject', data?.subject || '');
            setMessage(data?.message || '');
            if (data?.id) setId(data?.id);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        getMailTemplate();
    }, []);

    return (
        <Card>
            {isLoading ? (
                <div className='my-4'><Loader /></div>
            ) : (
                <CardContent>
                    <MailTemplateForm
                        onSubmit={handleSubmit(handleMailTemplateSubmit)}
                        register={register}
                        errors={errors}
                        apiErrors={apiErrors}
                        message={message}
                        editorRef={editorRef}
                        isButtonLoading={isButtonLoading}
                        mailTemplateSettingsPermission={mailTemplateSettingsPermission}
                    />
                </CardContent>
            )}
        </Card>
    );
};

export default WelcomeMailTemplate;
