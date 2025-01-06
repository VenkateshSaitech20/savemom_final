import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useForm, Controller } from 'react-hook-form';
import TextFieldStyled from '@core/components/mui/TextField';
import { otherData, registerData, responseData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';
import { CardContent, FormControl, FormHelperText, Grid, MenuItem } from '@mui/material';
import SubUserPermission from '@/utils/SubUserPermission';
import { base64ToFile, showToast } from '@/utils/helper';
import EditorComponent from '@/utils/EditorComponent';

const AddContent = props => {
    const { open, handleClose, handleContentAdded } = props;
    const [fileImg, setFileImg] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [categoryData, setCategoryData] = useState();
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({});
    const invalidImg = '/images/misc/invalid-files.jpg';
    const imgLimitText = `${otherData.fileLimitText} (${otherData.contentImgDim})`;
    const allowedFileTypes = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',');
    const { contentPermission } = SubUserPermission();

    const editorRef = useRef();

    const handleReset = () => {
        handleClose()
        setApiErrors({});
        reset();
        setImgSrc('');
        setFileImg('');
        editorRef.current?.clearContent();
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
                        setApiErrors(prev => ({ ...prev, image: '' }));
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

    const handleAddContent = async (data) => {
        if (apiErrors?.image) {
            return;
        }
        data.content = editorRef.current?.getHTML();
        setApiErrors({});
        setIsButtonLoading(true);
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
            const fileName = 'content-image.png';
            const fileLightImg = base64ToFile(fileImg, fileName);
            formData.append('image', fileLightImg);
        }
        const response = await apiClient.post('/api/content-management/content', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.result === true) {
            showToast(true, response.data.message);
            handleContentAdded();
            setApiErrors({});
            setIsButtonLoading(false);
            handleClose();
            handleReset();
            reset();
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            } else {
                setApiErrors(response.data.message)
            }
        }
        setIsButtonLoading(false);
    };

    useEffect(() => {
        getCategories();
    }, []);

    return (
        <Drawer
            open={open}
            anchor='right'
            variant='temporary'
            onClose={handleReset}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400, md: 800 } } }}
        >
            <div className='flex items-center justify-between p-6'>
                <Typography variant='h5'>Add Content</Typography>
                <IconButton size='small' onClick={handleReset}>
                    <i className='bx-x text-textPrimary text-2xl' />
                </IconButton>
            </div>
            <Divider />
            <div>
                <CardContent>
                    <div className='flex max-sm:flex-col items-center gap-6'>
                        {imgSrc && <img height={100} width={100} className='rounded' src={imgSrc} alt='Logo' />}
                        {((contentPermission?.editPermission === "Y" || contentPermission?.writePermission === "Y")) && (
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
                <CardContent>
                    <form autoComplete='off' onSubmit={handleSubmit(handleAddContent)}>
                        <Grid container spacing={6}>
                            <Grid item xs={12}>
                                <TextFieldStyled
                                    fullWidth
                                    variant='filled'
                                    size={"small"}
                                    InputLabelProps={{ shrink: true }}
                                    label={<CustomInputLabel htmlFor='title' text='Title' />}
                                    placeholder='Title'
                                    error={!!errors.title || apiErrors?.title}
                                    helperText={errors?.title?.message || apiErrors?.title}
                                    {...register('title', { required: registerData.titleReq, validate: value => value.trim() !== '' || registerData.titleReq })}
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
                                <EditorComponent ref={editorRef} placeholder="Enter content" />
                                {apiErrors?.content && (
                                    <div className='plb-3 pli-6'>
                                        <Typography variant="body2" color="error" className="mt-1">{apiErrors.content}</Typography>
                                    </div>
                                )}
                            </Grid>
                            <Grid item xs={12} className='flex gap-4 flex-wrap'>
                                {(contentPermission?.editPermission === "Y" || contentPermission?.writePermission === "Y") && (
                                    <Button variant='contained' type='submit'>
                                        {isButtonLoading ? <Loader type="btnLoader" /> : "Add content"}
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </div>
        </Drawer>
    )
}

AddContent.propTypes = {
    open: PropTypes.any,
    handleClose: PropTypes.func,
    handleContentAdded: PropTypes.func,
};

export default AddContent
