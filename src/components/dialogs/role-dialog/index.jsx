'use client'
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import DialogCloseButton from '../DialogCloseButton';
import TextFieldStyled from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';
import { registerData } from '@/utils/message';
import Loader from '@/components/loader';
import PropTypes from "prop-types";
import apiClient from '@/utils/apiClient';
import CustomInputLabel from '@/components/asterick';

const RoleDialog = ({ open, setOpen, roleData, roleId, updateRoles, showToast, toastMessage }) => {
    const [permissionError, setPermissionError] = useState('');
    const [apiErrors, setApiErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [defaultData, setDefaultData] = useState([]);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState({
        hasRead: [],
        hasWrite: [],
        hasEdit: [],
        hasDelete: []
    })
    const { control, handleSubmit, setValue, reset } = useForm({
        defaultValues: {
            roleName: '',
            permissions: {
                hasRead: [],
                hasWrite: [],
                hasEdit: [],
                hasDelete: []
            }
        },
        mode: 'onChange'
    });

    const getRole = useCallback(async () => {
        if (!roleId) return;
        try {
            setIsLoading(true);
            const response = await apiClient.get(`/api/user-role/id?id=${roleId}`);
            if (response.data.result) {
                const role = response.data.message;
                setValue('roleName', role.roleName);
                const permissions = role.permissions || {
                    hasRead: [],
                    hasWrite: [],
                    hasEdit: [],
                    hasDelete: []
                };
                setSelectedPermissions(permissions);
                setValue('permissions', permissions);
            } else {
                setApiErrors({ roleExists: response.data.message });
            }
            setIsLoading(false);
        } catch (error) {
            setApiErrors({ roleExists: error.message });
            setIsLoading(false);
        }
    }, [roleId, setValue]);


    const getMenus = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post('/api/menu/get-user-menus');
        if (response.data.result === true) {
            setDefaultData(response.data.message);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (open) {
            getRole();
            getMenus();
        }
    }, [getRole, open, getMenus]);


    const handleClose = () => {
        setOpen(false);
        setApiErrors({});
        setPermissionError('');
        reset();
    };

    const togglePermission = (category, menuId) => {
        const updatedPermissions = { ...selectedPermissions };
        const index = updatedPermissions[category].indexOf(menuId);
        if (index > -1) {
            updatedPermissions[category].splice(index, 1);
        } else {
            updatedPermissions[category].push(menuId);
        }
        setSelectedPermissions(updatedPermissions);
        setValue('permissions', updatedPermissions);
    };

    const handleSelectAllCheckbox = category => {
        const allIds = defaultData?.map(row => row.menuId.toString());
        const shouldSelectAll = selectedPermissions[category]?.length !== allIds.length;
        const updatedPermissions = { ...selectedPermissions };
        if (shouldSelectAll) {
            updatedPermissions[category] = allIds;
        } else {
            updatedPermissions[category] = [];
        }
        setSelectedPermissions(updatedPermissions);
        setValue('permissions', updatedPermissions);
    };

    const handleAddRole = async (data) => {
        setIsButtonLoading(true);
        const hasPermissions =
            data.permissions.hasRead.length > 0 ||
            data.permissions.hasWrite.length > 0 ||
            data.permissions.hasEdit.length > 0 ||
            data.permissions.hasDelete.length > 0;

        if (!hasPermissions) {
            setPermissionError(registerData.permissionValMsg);
            setIsButtonLoading(false);
            return;
        }
        setPermissionError('');

        // Filter out permissions for which the permission type is marked as "N" in the menu data
        const filteredPermissions = {
            hasRead: data.permissions.hasRead.filter(menuId => {
                const menu = defaultData.find(item => item.menuId.toString() === menuId);
                return menu?.permission.hasRead === "Y";
            }),
            hasWrite: data.permissions.hasWrite.filter(menuId => {
                const menu = defaultData.find(item => item.menuId.toString() === menuId);
                return menu?.permission.hasWrite === "Y";
            }),
            hasEdit: data.permissions.hasEdit.filter(menuId => {
                const menu = defaultData.find(item => item.menuId.toString() === menuId);
                return menu?.permission.hasEdit === "Y";
            }),
            hasDelete: data.permissions.hasDelete.filter(menuId => {
                const menu = defaultData.find(item => item.menuId.toString() === menuId);
                return menu?.permission.hasDelete === "Y";
            })
        };

        const roleData = {
            roleName: data.roleName,
            permissions: filteredPermissions
        };

        if (roleId) { roleData.roleId = roleId };

        // Continue with your API request logic
        try {
            const response = await apiClient.post('/api/user-role', roleData);
            if (response.data.result === true) {
                setIsButtonLoading(false);
                handleClose();
                updateRoles();
                reset();
                showToast(true, toastMessage);
            } else {
                setIsButtonLoading(false);
                setApiErrors(response.data.message);
            }
        } catch (error) {
            setIsButtonLoading(false);
            setApiErrors({ roleExists: error.message });
        }
    };

    useEffect(() => {
        if (open && roleId) {
            getRole();
            getMenus();
        } else {
            reset({
                roleName: '',
                permissions: {
                    hasRead: [],
                    hasWrite: [],
                    hasEdit: [],
                    hasDelete: []
                }
            });
            setSelectedPermissions({
                hasRead: [],
                hasWrite: [],
                hasEdit: [],
                hasDelete: []
            });
        }
    }, [open, roleId, getRole, getMenus, reset]);


    const buttonContent = isButtonLoading ? <Loader type="btnLoader" /> : roleId ? 'Save Changes' : 'Add Role';

    return (
        <Dialog
            fullWidth
            maxWidth='md'
            scroll='body'
            open={open}
            onClose={handleClose}
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
        >
            <DialogCloseButton onClick={handleClose} disableRipple>
                <i className='bx-x' />
            </DialogCloseButton>
            <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
                {roleId ? 'Edit Role' : 'Add Role'}
                <Typography component='span' className='flex flex-col text-center'>
                    Set Role Permissions
                </Typography>
            </DialogTitle>
            {isLoading ? (<div className='my-4'>
                <Loader size='md' />
            </div>) : (
                <form onSubmit={handleSubmit(handleAddRole)} autoComplete='off'>
                    <DialogContent className='overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16'>
                        <Controller
                            name='roleName'
                            control={control}
                            defaultValue=''
                            rules={{ required: registerData.roleNameReq }}
                            render={({ field, fieldState }) => (
                                <TextFieldStyled
                                    label={<CustomInputLabel htmlFor='role-name' text='Role Name' />}
                                    variant='filled'
                                    fullWidth
                                    size='small'
                                    InputLabelProps={{ shrink: true }}
                                    placeholder='Enter Role Name'
                                    {...field}
                                    error={!!fieldState?.error || !!apiErrors?.roleName}
                                    helperText={fieldState?.error?.message || apiErrors?.roleName}
                                />
                            )}
                        />
                        {apiErrors?.roleExists && <Typography color='error'>{apiErrors.roleExists}</Typography>}
                        <Typography variant='h5' className='min-is-[225px]'>
                            Role Permissions
                        </Typography>
                        <div className='overflow-x-auto'>
                            <table className={tableStyles.table}>
                                <tbody>
                                    <tr className='border-bs-0'>
                                        <th className='pis-0'>
                                            <Typography variant='h6' className='whitespace-nowrap flex-grow min-is-[225px]'>
                                                Administrator Access
                                            </Typography>
                                        </th>
                                        <th className='!text-start pie-0'>
                                            <FormControlLabel
                                                className='mie-2 capitalize'
                                                style={{ width: '110px' }}
                                                control={
                                                    <Checkbox
                                                        onChange={() => handleSelectAllCheckbox('hasRead')}
                                                        checked={selectedPermissions.hasRead.length === defaultData?.length}
                                                    />
                                                }
                                                label='Select All'
                                            />
                                            <FormControlLabel
                                                className='mie-2 capitalize'
                                                style={{ width: '110px' }}
                                                control={
                                                    <Checkbox
                                                        onChange={() => handleSelectAllCheckbox('hasWrite')}
                                                        checked={selectedPermissions.hasWrite.length === defaultData?.length}
                                                    />
                                                }
                                                label='Select All'
                                            />
                                            <FormControlLabel
                                                className='mie-2 capitalize'
                                                style={{ width: '110px' }}
                                                control={
                                                    <Checkbox
                                                        onChange={() => handleSelectAllCheckbox('hasEdit')}
                                                        checked={selectedPermissions.hasEdit.length === defaultData?.length}
                                                    />
                                                }
                                                label='Select All'
                                            />
                                            <FormControlLabel
                                                className='mie-2 capitalize'
                                                style={{ width: '110px' }}
                                                control={
                                                    <Checkbox
                                                        onChange={() => handleSelectAllCheckbox('hasDelete')}
                                                        checked={selectedPermissions.hasDelete.length === defaultData?.length}
                                                    />
                                                }
                                                label='Select All'
                                            />
                                        </th>
                                    </tr>
                                    {defaultData?.map(({ menuId, subMenu, permission }) => (
                                        <tr key={menuId} className='border-bs-0'>
                                            <td className='pis-0'>
                                                <Typography className='min-is-[225px]'>
                                                    {subMenu}
                                                </Typography>
                                            </td>
                                            <td className='!text-start pie-0'>
                                                <FormGroup row>
                                                    {permission.hasRead === "Y" && (
                                                        <FormControlLabel
                                                            style={{ width: '110px' }}
                                                            className='mie-2'
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedPermissions.hasRead.includes(menuId.toString())}
                                                                    onChange={() => togglePermission('hasRead', menuId.toString())}
                                                                />
                                                            }
                                                            label='Read'
                                                        />
                                                    )}
                                                    {permission.hasWrite === "Y" && (
                                                        <FormControlLabel
                                                            style={{ width: '110px' }}
                                                            className='mie-2'
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedPermissions.hasWrite.includes(menuId.toString())}
                                                                    onChange={() => togglePermission('hasWrite', menuId.toString())}
                                                                />
                                                            }
                                                            label='Write'
                                                        />
                                                    )}
                                                    {permission.hasEdit === "Y" && (
                                                        <FormControlLabel
                                                            style={{ width: '110px' }}
                                                            className='mie-2'
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedPermissions.hasEdit.includes(menuId.toString())}
                                                                    onChange={() => togglePermission('hasEdit', menuId.toString())}
                                                                />
                                                            }
                                                            label='Edit'
                                                        />
                                                    )}
                                                    {/* <Button>{permission}</Button> */}
                                                    {permission.hasDelete === "Y" && (
                                                        <FormControlLabel
                                                            style={{ width: '110px' }}
                                                            className='mie-2'
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedPermissions.hasDelete.includes(menuId.toString())}
                                                                    onChange={() => togglePermission('hasDelete', menuId.toString())}
                                                                />
                                                            }
                                                            label='Delete'
                                                        />
                                                    )}
                                                </FormGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {permissionError && <Typography color='error'>{permissionError}</Typography>}
                        {apiErrors.permissions && <Typography color='error'>{apiErrors.permissions}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button type='submit' variant='contained' color='primary'>
                            {/* {roleId ? 'Save Changes' : 'Add Role'} */}
                            {buttonContent}
                        </Button>
                        <Button variant='outlined' onClick={handleClose}>
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            )}

        </Dialog>
    )
}

RoleDialog.propTypes = {
    open: PropTypes.any,
    setOpen: PropTypes.any,
    roleData: PropTypes.any,
    roleId: PropTypes.string,
    updateRoles: PropTypes.func,
    showToast: PropTypes.any,
    toastMessage: PropTypes.any,
};

export default RoleDialog
