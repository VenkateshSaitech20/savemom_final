import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const TablePaginationComponent = ({ table, totalPages, setCurrentPage, currentPage, paginationType }) => {
  return (
    // <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
    <div
      className={`flex justify-between items-center flex-wrap pli-6 ${paginationType !== "not-table" ? 'border-bs' : ''} bs-auto plb-[12.5px] gap-2`}
    >
      <Typography color='text.disabled'>
        {
          paginationType && paginationType !== "not-table" &&
          `
                    Showing ${table.getFilteredRowModel().rows.length === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                    to ${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} 
                    of ${table.getFilteredRowModel().rows.length} entries
                `
        }
      </Typography>
      <Pagination
        shape='rounded'
        color='primary'
        variant='tonal'
        count={totalPages}
        page={currentPage}
        onChange={(event, page) => setCurrentPage(page)}
        showFirstButton
        showLastButton
      />
    </div>
  );
};

TablePaginationComponent.propTypes = {
  table: PropTypes.object,
  totalPages: PropTypes.number,
  setCurrentPage: PropTypes.func,
  currentPage: PropTypes.number,
  paginationType: PropTypes.string
};

export default TablePaginationComponent;
