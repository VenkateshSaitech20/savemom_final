'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RoleDialog from '@components/dialogs/role-dialog';
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import Link from '@components/Link';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { toast } from 'react-toastify';
import apiClient from '@/utils/apiClient';
import { responseData } from '@/utils/message';
import { signOut } from 'next-auth/react';

const RoleCards = ({ tableData, updateRoles, manageRolesPermission }) => {
  const [cardData, setCardData] = useState([])

  const typographyProps = {
    children: 'Edit Role',
    component: Link,
    color: 'primary',
    onClick: e => e.preventDefault()
  }

  const getUserRoleGroubList = useCallback(async () => {
    const response = await apiClient.post('/api/user-role/role-list', {})
    if (response.data.result === true) {
      setCardData(response.data.message)
    } else if (response.data.result === false) {
      if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
        sessionStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    if (tableData) {
      getUserRoleGroubList()
    }
  }, [tableData]);

  const showToast = (success, message) => {
    if (success) {
      toast.success(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const CardProps = {
    className: 'cursor-pointer bs-full',
    children: (
      <Grid container className='bs-full'>
        <Grid item xs={6}>
          <div className='flex items-end justify-center bs-full'>
            <img alt='add-role' src='/images/illustrations/characters/1.png' height={130} />
          </div>
        </Grid>
        <Grid item xs={6}>
          <CardContent>
            <div className='flex flex-col items-end gap-4 text-right' inert="true">
              <Button variant='contained' size='small'>
                Add New Role
              </Button>
              <Typography>
                Add new role, <br />
                if it doesn&#39;t exist.
              </Typography>
            </div>
          </CardContent>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {cardData?.map((item, index) => (
        <Grid item xs={12} sm={6} lg={4} key={item.id}>
          <Card>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <Typography className='flex-grow'>{`Total ${item.totalUsers} users`}</Typography>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex flex-col items-start gap-1'>
                  <Typography variant='h5'>{item.title}</Typography>
                  <OpenDialogOnElementClick
                    element={Typography}
                    elementProps={manageRolesPermission && manageRolesPermission?.editPermission === "Y" ? typographyProps : {}}
                    dialog={RoleDialog}
                    dialogProps={{ title: item.title, updateRoles, showToast, toastMessage: "Role updated successfully" }}
                    roleId={item.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {manageRolesPermission && manageRolesPermission?.writePermission === "Y" && (<Grid item xs={12} sm={6} lg={4}>
        <OpenDialogOnElementClick
          element={Card}
          elementProps={CardProps}
          dialog={RoleDialog}
          dialogProps={{ updateRoles, showToast, toastMessage: "Role added successfully", manageRolesPermission }}
        />
      </Grid>)}
    </Grid>
  )
}

RoleCards.propTypes = {
  tableData: PropTypes.any,
  updateRoles: PropTypes.func,
  manageRolesPermission: PropTypes.any,
};

export default RoleCards
