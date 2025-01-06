'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Link from '@components/Link';
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
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick';
import CityDialog from '@/components/dialogs/edit-city-info';
import { pageList, responseData } from '@/utils/message';
import apiClient from '@/utils/apiClient';
import { signOut } from 'next-auth/react';
import Chip from '@mui/material/Chip'
import AddCity from './AddCity';
import { CardContent } from '@mui/material';
const Icon = styled('i')({})
const fuzzyFilter = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank
    })
    return itemRank.passed
};
const columnHelper = createColumnHelper()
const CityTable = ({ masterSettingsPermission }) => {
    const [addCityOpen, setAddCityOpen] = useState(false)
    const [rowSelection, setRowSelection] = useState({})
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState('');
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(Number(pageList[0].value));
    const [totalPages, setTotalPages] = useState();
    const typographyProps = {
        children: (
            <IconButton >
                <i className='bx-edit-alt text-textSecondary text-[22px]' />
            </IconButton>
        ),
        component: Link,
        color: 'primary',
        onClick: e => e.preventDefault()
    }
    const handleDelete = async sId => {
        setIdToDelete(sId);
        setOpen(true);
    };
    const getCities = useCallback(async (searchText) => {
        setIsLoading(true);
        const response = await apiClient.post("/api/master-data-settings/city/list", {
            searchText,
            page: currentPage,
            pageSize
        });
        if (response.data.result === true) {
            setData(response.data.message);
            setFilteredData(response.data.message);
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
    const handleCityAdded = () => {
        getCities(searchText);
    };
    useEffect(() => {
        getCities(searchText);
    }, [getCities]);
    const handleConfirmation = async (confirmed) => {
        setIsLoading(true);
        if (confirmed) {
            const response = await apiClient.put('/api/master-data-settings/city', { id: idToDelete });
            if (response.data.result === true) {
                await getCities(searchText);
                setOpen(false);
            } else if (response.data.result === false) {
                if (response?.data?.message?.roleError?.name === responseData.tokenExpired || response?.data?.message?.invalidToken === responseData.invalidToken) {
                    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
                    sessionStorage.removeItem("token");
                }
            }
        };
        setIsLoading(false);
        setIdToDelete(null);
    };
    const handleCityUpdate = () => {
        getCities(searchText);
    };
    const columns = useMemo(() => {
        const canDelete = masterSettingsPermission?.deletePermission === 'Y';
        const canEdit = masterSettingsPermission?.editPermission === 'Y';
        const baseColumns = [

            columnHelper.accessor('name', {
                header: 'District',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography className='capitalize' color='text.primary'>
                            {row.original.name}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('lgdCode', {
                header: 'LGD code',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography color='text.primary' >
                            {row.original.lgdCode}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('shortname', {
                header: 'Short name',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography color='text.primary' >
                            {row.original.shortname}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('state', {
                header: 'State',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography className='capitalize' color='text.primary'>
                            {row.original.state}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('country', {
                header: 'Country',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Typography color='text.primary' >
                            {row.original.country}
                        </Typography>
                    </div>
                )
            }),
            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: ({ row }) => (
                    <div className='flex items-center gap-2'>
                        <Icon />
                        <Chip label={row.original.isActive === 'Y' ? 'Yes' : 'No'} variant='tonal' size='small' color={row.original.isActive === 'Y' ? 'success' : 'error'} className='self-start' />
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
                            {canEdit && (
                                <IconButton onClick={() => handleDelete(row.original.id)}>
                                    <i className='bx-trash text-textSecondary text-[22px]' />
                                </IconButton>
                            )}
                            {canEdit && (
                                <OpenDialogOnElementClick
                                    element={Typography}
                                    elementProps={typographyProps}
                                    dialog={CityDialog}
                                    dialogProps={{ data: data, id: row.original.id, handleCityUpdate }}
                                />
                            )}
                        </div>
                    ),
                    enableSorting: false
                })
            );
        }
        return baseColumns;
    }, [data, filteredData, masterSettingsPermission]);
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
    const handleSearchTextChange = (e) => {
        setGlobalFilter(e.target.value);
        setSearchText(e.target.value);
    };
    const handleCitySearch = () => {
        getCities(searchText);
    };
    return (
        <>
            <Card>
                <CardContent className='flex justify-between flex-wrap max-sm:flex-col sm:items-center gap-4'>
                    <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                        <TextFieldStyled
                            value={globalFilter ?? ''}
                            onChange={handleSearchTextChange}
                            placeholder='Search District'
                            className='max-sm:is-full min-is-[220px]'
                            InputLabelProps={{ shrink: true }}
                            variant='filled'
                        />
                        <Button variant='tonal' color='primary' onClick={handleCitySearch}>
                            {isLoading ? <Loader type="btnLoader" /> : 'Search'}
                        </Button>
                    </div>
                    <div className='flex gap-4 max-sm:flex-col max-sm:is-full'>
                        {masterSettingsPermission && masterSettingsPermission?.writePermission === "Y" && (
                            <Button
                                variant='contained'
                                startIcon={<i className='bx-plus' />}
                                onClick={() => setAddCityOpen(!addCityOpen)}
                                className='max-sm:is-full'
                            >
                                Add District
                            </Button>
                        )}
                        <TextFieldStyled
                            select
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className='page-drop-size'
                            InputLabelProps={{ shrink: true }}
                            variant='filled'
                        >
                            {pageList?.map(item => (
                                <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                            ))}
                        </TextFieldStyled>
                    </div>
                </CardContent>
                <div className='overflow-x-auto'>
                    <table className={tableStyles.table}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div className={classnames({
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
                                {isLoading ?
                                    <tr>
                                        <td colSpan={table.getVisibleFlatColumns().length ?? 0} className='text-center'>
                                            <Loader />
                                        </td>
                                    </tr>
                                    : table.getRowModel()
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
                <TablePaginationComponent
                    table={table}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
                <ConfirmationDialog open={open} setOpen={setOpen} type='delete-district' onConfirm={handleConfirmation} />
            </Card>
            <AddCity
                open={addCityOpen}
                handleClose={() => setAddCityOpen(!addCityOpen)}
                handleCityAdded={handleCityAdded}
            />
        </>
    )
}
CityTable.propTypes = {
    masterSettingsPermission: PropTypes.any,
}
export default CityTable
