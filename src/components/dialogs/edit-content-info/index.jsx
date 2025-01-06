'use client'
import { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, registerData, responseData } from '@/utils/message';
import { Controller, useForm } from 'react-hook-form';
import { base64ToFile, showToast } from '@/utils/helper';
import { signOut } from 'next-auth/react';
import PropTypes from "prop-types";
import Loader from '@/components/loader';
import apiClient from '@/utils/apiClient';
import { CardContent, Divider, FormControl, FormHelperText, MenuItem } from '@mui/material';
import CustomInputLabel from '@/components/asterick';
import EditorComponent from '@/utils/EditorComponent';

const EditContent = ({ open, setOpen, data, id, handleContentUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [fileImg, setFileImg] = useState('');
    const [imgSrc, setImgSrc] = useState('');
    const [categoryData, setCategoryData] = useState();
    const { register, handleSubmit, formState: { errors }, reset, control } = useForm({});
    const imgLimitText = `${otherData.fileLimitText} (${otherData.contentImgDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const [content, setContent] = useState('');

    const editorRef = useRef();

    const handleFileInputChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;
                    if (type === 'image') {
                        setImgSrc(base64Data);
                        setFileImg(base64Data);
                        setApiErrors(prev => ({ ...prev, image: "" }));
                    }
                };
                setApiErrors({});
                reader.readAsDataURL(file);
            } else if (type === 'image') {
                setImgSrc(invalidImg);
                setApiErrors(prev => ({ ...prev, image: responseData.invalidFileType }));
            }
        }
    };

    useEffect(() => {
        if (open && data) {
            reset({
                title: data.title || '',
                categoryId: data.categoryId || '',
                shortContent: data.shortContent || '',
                content: data.content || '',
            });
            setImgSrc(data.image);
            setContent(data.content || '');
            setApiErrors({});
        }
    }, [data, open, reset]);


    const handleClose = () => {
        setOpen(false)
        // reset()
    };

    const getCategories = async () => {
        const response = await apiClient.get("/api/content-management/category", {});
        if (response.data.result === true) {
            setCategoryData(response.data.message);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleSubmitContentUpdate = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        setApiErrors({});
        setIsLoading(true);
        data.content = editorRef.current?.getHTML();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}[]`, JSON.stringify(item));
                });
            } else {
                formData.append(key, value === null ? "" : value);
            }
        });
        if (fileImg) {
            const fileImage = 'content-image.png';
            const fileLightImg = base64ToFile(fileImg, fileImage);
            formData.append('image', fileLightImg);
        }
        if (id) formData.append('id', id);
        const { data: { result, message } } = await apiClient.post('/api/content-management/content', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (result === true) {
            handleContentUpdate(message);
            setOpen(false);
            setApiErrors({});
            showToast(true, responseData.dataUpdated);
        } else if (result === false) {
            if (message?.roleError?.name === responseData.tokenExpired || message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(message);
            }
        }
        setIsLoading(false);
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            maxWidth='md'
            scroll='body'
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
                <i className='bx-x' />
            </DialogCloseButton>
            <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                Edit Content
            </DialogTitle>

            <CardContent className='overflow-visible pbs-0 sm:pli-16'>
                <div className='flex max-sm:flex-col items-center gap-6'>
                    {imgSrc && <img className='rounded w-[100px] h-[100px]' src={imgSrc} alt='Blog pic' />}
                    {(
                        <div className='flex flex-grow flex-col gap-4'>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <FormControl>
                                    <Button component='label' variant='contained' htmlFor='content-image'>
                                        Upload Image
                                        <input
                                            hidden
                                            type='file'
                                            accept='image/png, image/jpeg'
                                            onChange={(e) => { handleFileInputChange(e, 'image') }}
                                            id='content-image'
                                        />
                                    </Button>
                                    {apiErrors?.image && (
                                        <FormHelperText className='text-red-500'>
                                            {apiErrors?.image}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </div>
                            <Typography>{imgLimitText}</Typography>
                        </div>
                    )}
                </div>
                <Divider className='mbs-4' />
            </CardContent>

            <form onSubmit={handleSubmit(handleSubmitContentUpdate)}>
                <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                label={<CustomInputLabel htmlFor='title' text='Title' />}
                                placeholder='Title'
                                InputLabelProps={{ shrink: true }}
                                variant='filled'
                                {...register('title', { required: registerData.titleReq })}
                                error={!!errors?.title || !!apiErrors?.title}
                                helperText={errors?.title ? errors?.title?.message : '' || apiErrors?.title}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name='categoryId'
                                control={control}
                                defaultValue=''
                                rules={{ required: registerData.categoryReq }}
                                render={({ field }) => (
                                    <TextFieldStyled
                                        select
                                        fullWidth
                                        id='categoryId'
                                        label={<CustomInputLabel htmlFor='category' text='Category' />}
                                        size="small"
                                        variant='filled'
                                        InputLabelProps={{ shrink: true }}
                                        {...field}
                                        error={!!errors.categoryId || apiErrors?.categoryId}
                                        helperText={errors?.categoryId?.message || apiErrors?.categoryId}
                                    >
                                        <MenuItem value='' disabled>
                                            Select Category
                                        </MenuItem>
                                        {categoryData?.map((category) => (
                                            <MenuItem value={category.id} key={category.id}>
                                                {category.categoryName}
                                            </MenuItem>
                                        ))}
                                    </TextFieldStyled>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextFieldStyled
                                fullWidth
                                variant='filled'
                                size={"small"}
                                InputLabelProps={{ shrink: true }}
                                label={<CustomInputLabel htmlFor='shortContent' text='Short content' />}
                                placeholder='Enter short content'
                                multiline={true}
                                rows={3}
                                error={!!errors.shortContent || apiErrors?.shortContent}
                                helperText={errors?.shortContent?.message || apiErrors?.shortContent}
                                {...register('shortContent', { required: registerData.shortContentReq, validate: value => value.trim() !== '' || registerData.shortContentReq })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography style={{ marginBottom: '5px' }}>Blog Content <span style={{ color: '#ff4525' }}>*</span></Typography>
                            <EditorComponent ref={editorRef} placeholder="Enter content" data={content} />
                            {apiErrors?.content && (
                                <div className='plb-3 pli-6'>
                                    <Typography variant="body2" color="error" className="mt-1">{apiErrors.content}</Typography>
                                </div>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
                    <Button variant='contained' type='submit'>
                        {isLoading ? <Loader type="btnLoader" /> : 'Submit'}
                    </Button>
                    <Button variant='tonal' color='secondary' type='reset' onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

EditContent.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.func,
    data: PropTypes.any,
    id: PropTypes.any,
    handleContentUpdate: PropTypes.any,
    showToast: PropTypes.any,
};
export default EditContent
