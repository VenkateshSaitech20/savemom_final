'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
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
import TextFieldStyled from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import Loader from '@/components/loader';
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { pageList, registerData, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import AddBrand from './AddBrand';
import CustomAvatar from '@/@core/components/mui/Avatar';
import { FormControlLabel, FormGroup, Switch } from '@mui/material';
const Icon = styled('i')({})
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })
    return itemRank.passed
};

const columnHelper = createColumnHelper()
const BrandTable = ({ websiteSettingsPermission }) => {
    const [addBrandOpen, setAddBrandOpen] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();

    const handleDelete = async userId => {
        setIdToDelete(userId);
        setOpen(true);
    };
    const getBrands = useCallback(async () => {
        setIsLoading(true);
        const response = await apiClient.post("/api/website-settings/brand/list", {
            page: currentPage,
            pageSize
        });
        if (response.data.result === true) {
            setData(response.data.message);
            setFilteredData(response.data.message)
            setTotalPages(response.data.totalPages);
            setIsLoading(false);
        } else if (response.data.result === false) {
            if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                sessionStorage.removeItem("token");
            }
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);
    const handleConfirmation = async (confirmed) => {
        setIsLoading(true);
        if (confirmed) {
            try {
                const response = await apiClient.delete('/api/website-settings/brand/brandimage', {
                    data: { id: idToDelete }
                });
                if (response?.data?.result === true) {
                    await getBrands();
                    setOpen(false);
                } else if (response?.data?.result === false) {
                    const message = response?.data?.message;
                    if (message?.roleError?.name === responseData.tokenExpired || message?.invalidToken === responseData.invalidToken) {
                        await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                        sessionStorage.removeItem("token");
                    }
                }
            } catch (error) {
                console.error("Failed to delete the brand image:", error);

            }
        }
        setIsLoading(false);
        setIdToDelete(null);
    };
    useEffect(() => {
        getBrands()
    }, [getBrands]);
    const { lang: locale } = useParams()

    const getAvatar = params => {
        const { avatar } = params

        if (avatar) {
            return <CustomAvatar src={avatar} size={34} />
        }
    }
    const columns = useMemo(() => {
        const canDelete = websiteSettingsPermission?.deletePermission === 'Y';
        const canEdit = websiteSettingsPermission?.editPermission === 'Y';

        const baseColumns = [

            columnHelper.accessor('image', {
                header: 'Image',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <img height={30} width={100} className='rounded ' src={row?.original?.image} alt={row?.original?.image} />
                    </div>
                )
            }),

        ];
        if (canDelete || canEdit) {
            baseColumns.push(
                columnHelper.accessor('action', {
                    header: 'Action',
                    cell: ({ row }) => (
                        <div className='flex items-center'>
                            {canEdit && (
                                <IconButton onClick={() => handleDelete(row.original.id)}>
                                    <i className='bx-trash text-textSecondary text-[22px]' />
                                </IconButton>
                            )}

                        </div>
                    ),
                    enableSorting: false
                })
            );
        }
        return baseColumns;
    }, [data, filteredData, websiteSettingsPermission]);

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
        onPaginationChange: ({ pageSize, pageIndex }) => {
            setPageSize(pageSize);
            setCurrentPage(pageIndex + 1);
        },
        enableRowSelection: true,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues()
    })
    const handleBrandAdded = async () => {
        await getBrands();
    };
    const [apiErrors, setApiErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [id, setId] = useState('');
    const [checked, setChecked] = useState(true);


    const handleChange = async (event) => {
        setChecked(event.target.checked);
        const togglestatus = event.target.checked ? 'Y' : 'N'
        setApiErrors({});
        setIsButtonLoading(true);
        const postData = {};
        postData.sectionType = 'brand';
        postData.isfrontendvisible = togglestatus
        if (id) { postData.id = id }
        const response = await apiClient.post('/api/website-settings/section-content', postData);
        if (response?.data?.result === true) {
            setApiErrors({});
            getBrandSection('brand');
            setIsButtonLoading(false);
        } else {
            setApiErrors(response.data.message);
            setIsButtonLoading(false);
        }

    };
    const getBrandSection = async (sectionType) => {
        setIsLoading(true);
        const response = await apiClient.get(`/api/website-settings/section-content?sectionType=${sectionType}`);
        if (response.data.result === true) {
            const { id } = response.data.message;
            setId(id);
            setChecked(response.data.message.isfrontendvisible === "Y" ? true : false);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getBrandSection('brand');
    }, []);
    return (
        <>
            <Card>
                <div className='flex justify-between items-center p-6 border-bs'>
                    <CardHeader title='Filters' className='mbe-0 p-0' />
                    <FormGroup>
                        <FormControlLabel
                            control={<Switch checked={checked} onChange={handleChange} />}
                            label={registerData.landingPageVisibleLabel}
                            labelPlacement="start"
                            className='pbe-0'
                        />
                    </FormGroup>
                </div>
                <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
                    <TextFieldStyled
                        select
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className='max-sm:is-full sm:is-[80px]'
                        InputLabelProps={{ shrink: true }}
                        variant='filled'
                    >
                        {pageList?.map(item => (
                            <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                        ))}
                    </TextFieldStyled>
                    <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
                        {websiteSettingsPermission && websiteSettingsPermission?.writePermission === "Y" && (
                            <Button
                                variant='contained'
                                startIcon={<i className='bx-plus' />}
                                onClick={() => setAddBrandOpen(!addBrandOpen)}
                                className='max-sm:is-full'>
                                Add Brand
                            </Button>
                        )}
                    </div>
                </div>
                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
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
                                                </div>
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
                                {table.getRowModel().rows.slice(0, pageSize).map(row => (
                                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>

                <TablePaginationComponent
                    table={table}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
                <ConfirmationDialog open={open} setOpen={setOpen} type='delete-brand' onConfirm={handleConfirmation} />
            </Card>
            <AddBrand
                open={addBrandOpen}
                handleClose={() => setAddBrandOpen(!addBrandOpen)}
                handleBrandAdded={handleBrandAdded}
            />
        </>
    )
}
BrandTable.propTypes = {
    websiteSettingsPermission: PropTypes.any,
}
export default BrandTable


