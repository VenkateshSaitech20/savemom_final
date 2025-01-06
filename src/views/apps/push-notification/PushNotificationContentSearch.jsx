// MUI Imports
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import PropTypes from "prop-types";

const PushNotificationContentSearch = props => {
  // Props
  const { isBelowScreen, searchTerm, setSidebarOpen, setBackdropOpen, setSearchTerm } = props

  // Open sidebar on below md screen
  const handleToggleSidebar = () => {
    setSidebarOpen(true)
    setBackdropOpen(true)
  }

  return (
    <div className='flex items-center gap-1 is-full pli-6 border-be'>
      {isBelowScreen && (
        <IconButton onClick={handleToggleSidebar}>
          <i className='bx-menu text-textSecondary' />
        </IconButton>
      )}
      <InputBase
        fullWidth
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        startAdornment={<i className='bx-search text-textSecondary mie-4' />}
        placeholder='Search Push notification'
        className='bs-[56px]'
      />
    </div>
  )
}

PushNotificationContentSearch.propTypes = {
  isBelowScreen: PropTypes.any,
  searchTerm: PropTypes.any,
  setSidebarOpen: PropTypes.any,
  setBackdropOpen: PropTypes.any,
  setSearchTerm: PropTypes.any,
};
export default PushNotificationContentSearch
