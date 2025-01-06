'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import PropTypes from "prop-types";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table';
import { getLocalizedUrl } from '@/utils/i18n';
import tableStyles from '@core/styles/table.module.css';
import Loader from '@/components/loader';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { pageList, registerData, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import AddPayment from './AddPayment';
import { showToast } from '@/utils/helper';
import { MenuItem, Select } from '@mui/material';
const Icon = styled('i')({})
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })

    return itemRank.passed
}
const columnHelper = createColumnHelper()
const TypeCell = ({ type }) => (
    <div className='flex items-center gap-2'>
        <Icon />
        <Typography color='text.primary'>
            {type}
        </Typography>
    </div>
);
const PaymentGatewayListTable = ({ configureSubscriptionPermission }) => {
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const [open, setOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const router = useRouter();
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();
    const handleDelete = async userId => {
        setApiErrors({});
        setIdToDelete(userId);
        setOpen(true);
    };
    const getPaymentMethods = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.get("/api/configure-subscription");
        if (response?.data?.result === true) {
            setData(response.data.message);
            setFilteredData(response.data.message)
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
        }
    }, []);
    const handleConfirmation = async (confirmed) => {
        setIsLoading(true);
        if (confirmed) {
            const response = await apiClient.delete('/api/configure-subscription', { data: { id: idToDelete } });
            if (response.data.result === true) {
                await getPaymentMethods();
                setOpen(false);
                return true;
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                } else if (response?.data?.message?.delError === registerData.paymentgatewayMsg) {
                    setApiErrors(response?.data?.message);
                    setOpen(true);
                    return false;
                }
            }
        };
        setIsLoading(false);
        setIdToDelete(null);
    };
    const handleViewPaymentMethod = (id) => {
        const url = getLocalizedUrl(`/pages/configure-subscription/${id}`, locale)
        router.push(url);
    };
    const handleUpdateStatus = async (id) => {
        setIsLoading(true);
        const { data: { result, message } } = await apiClient.put('/api/configure-subscription', { id });
        if (result) {
            showToast(true, message);
            getPaymentMethods();
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getPaymentMethods()
    }, [getPaymentMethods]);
    const { lang: locale } = useParams()
    const columns = useMemo(() => {
        const canDelete = configureSubscriptionPermission?.deletePermission === 'Y';
        const canEdit = configureSubscriptionPermission?.editPermission === 'Y';
        const baseColumns = [
            columnHelper.accessor('name', {
                header: 'Name',
                cell: ({ row }) => <TypeCell type={row.original.name} />
            }),
            columnHelper.accessor('publicKey', {
                header: 'Public Key',
                cell: ({ row }) => <TypeCell type={row.original.publicKey} />
            }),
            columnHelper.accessor('PrivateKey', {
                header: 'privateKey',
                cell: ({ row }) => <TypeCell type={row.original.privateKey} />
            }),
            columnHelper.accessor('type', {
                header: 'type',
                cell: ({ row }) => <TypeCell type={row.original.type} />
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: ({ row }) => (
                    <div className='flex items-center gap-3'>
                        {canEdit ? (<Select
                            sx={{ '.MuiOutlinedInput-notchedOutline': { borderStyle: 'none' } }}
                            className={`h-8 ${row.original.isActive === "Y" ? "bg-green-200 text-black" : "bg-red-200 text-black"}`}
                            value={row.original.isActive === "Y" ? "Yes" : "No"}
                            onChange={() => handleUpdateStatus(row.original.id)}
                        >
                            <MenuItem value='Yes' className="bg-green-200 text-black">Yes</MenuItem>
                            {row.original.isActive === "N" && (<MenuItem value='No' className='bg-red-200 text-black'>No</MenuItem >)}
                        </Select>) : (
                            <Typography color='text.primary'>
                                {row.original.isActive === "Y" ? "Active" : "Inactive"}
                            </Typography>
                        )}
                    </div>
                )
            })
        ];

        if (canDelete || canEdit) {
            baseColumns.push(
                columnHelper.accessor('action', {
                    header: 'Action',
                    cell: ({ row }) => (
                        <div className='flex items-center'>
                            {canDelete && (
                                <IconButton onClick={() => handleDelete(row.original.id)}>
                                    <i className='bx-trash text-textSecondary text-[22px]' />
                                </IconButton>
                            )}
                            {canEdit && (
                                <IconButton onClick={() => handleViewPaymentMethod(row.original.id)}>
                                    <i className='bx-show text-textSecondary text-[22px]' />
                                </IconButton>
                            )}
                        </div>
                    ),
                    enableSorting: false
                })
            );
        }

        return baseColumns;
    }, [data, filteredData, configureSubscriptionPermission]);
    const table = useReactTable({
        data: filteredData,
        columns,
        pageCount: totalPages,
        manualPagination: true,
        state: {
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize: pageSize
            }
        },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    })
    const handleUserAdded = async () => {
        await getPaymentMethods();
    };
    return (
        <>
            <Card>
                <div className='flex justify-between items-center p-3 border-bs'>
                    <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
                        {configureSubscriptionPermission && configureSubscriptionPermission?.writePermission === "Y" && (
                            <Button
                                variant='contained'
                                startIcon={<i className='bx-plus' />}
                                onClick={() => setAddUserOpen(!addUserOpen)}
                                className='max-sm:is-full'
                            >
                                Add New Payment
                            </Button>
                        )}
                    </div>
                </div>
                <div className=''>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <span
                                                    className={classnames({
                                                        'flex items-center': header.column.getIsSorted(),
                                                        'cursor-pointer select-none': header.column.getCanSort()
                                                    })}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <i className='bx-chevron-up text-xl' />,
                                                        desc: <i className='bx-chevron-down text-xl' />
                                                    }[header.column.getIsSorted()] ?? null}
                                                </span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        {table.getFilteredRowModel().rows.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={table.getVisibleFlatColumns().length ?? 0} className='text-center'>
                                        {isLoading ? <Loader /> : 'No data available'}
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {table.getRowModel()
                                    .rows.slice(0, pageSize)
                                    .map(row => {
                                        return (
                                            <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                                {row.getVisibleCells().map(cell => (
                                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        )}
                    </table>
                </div>
                <ConfirmationDialog open={open} setOpen={setOpen} type='payment-method' onConfirm={handleConfirmation} errorMsg={apiErrors.delError} />
            </Card>
            <AddPayment
                open={addUserOpen}
                handleClose={() => setAddUserOpen(!addUserOpen)}
                onUserAdded={handleUserAdded}
            />
        </>
    )
}
PaymentGatewayListTable.propTypes = {
    configureSubscriptionPermission: PropTypes.any,
}
TypeCell.propTypes = {
    type: PropTypes.any,
}
export default PaymentGatewayListTable
