import { useState } from 'react';
import { moveEmailsToFolder, deleteTrashEmails, toggleReadEmails, toggleStarEmail } from '@/redux-store/slices/email';
import VoiceCallContentSearch from './VoiceCallContentSearch';
import VoiceCallContentList from './VoiceCallContentList';
import VoiceCallDetails from './VoiceCallDetails';
import PropTypes from "prop-types";

const VoiceCallContent = props => {
  const {
    folder,
    label,
    store,
    dispatch,
    uniqueLabels,
    isInitialMount,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    setBackdropOpen,
    voiceCallDeliveredStatus
  } = props

  // States
  const [selectedEmails, setSelectedEmails] = useState(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reload, setReload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentSMS, setCurrentSMS] = useState(null);

  // Vars
  const sms = store.filteredEmails;

  const areFilteredEmailsNone =
    sms.length === 0 ||
    sms.filter(
      email =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.from.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).length === 0

  // Action for deleting single email
  const handleSingleEmailDelete = (e, emailId) => {
    e.stopPropagation()
    setSelectedEmails(prevSelectedEmails => {
      const newSelectedEmails = new Set(prevSelectedEmails)

      newSelectedEmails.delete(emailId)

      return newSelectedEmails
    })

    if (folder === 'trash') {
      dispatch(deleteTrashEmails({ emailIds: [emailId] }))
    } else {
      dispatch(moveEmailsToFolder({ emailIds: [emailId], folder: 'trash' }))
    }
  }

  // Toggle read status for single email
  const handleToggleIsReadStatus = (e, id) => {
    e.stopPropagation()
    dispatch(toggleReadEmails({ emailIds: [id] }))
  }

  // Toggle star for single email
  const handleToggleStarEmail = (e, id) => {
    e.stopPropagation()
    dispatch(toggleStarEmail({ emailId: id }))
  }

  return (
    <div className='flex flex-col items-center justify-center is-full bs-full relative overflow-hidden bg-backgroundPaper'>
      <VoiceCallContentSearch
        isBelowScreen={isBelowMdScreen}
        searchTerm={searchTerm}
        setSidebarOpen={setSidebarOpen}
        setBackdropOpen={setBackdropOpen}
        setSearchTerm={setSearchTerm}
      />
      {/* <MailContentActions
        areFilteredEmailsNone={areFilteredEmailsNone}
        selectedEmails={selectedEmails}
        setSelectedEmails={setSelectedEmails}
        sms={sms}
        folder={folder}
        label={label}
        uniqueLabels={uniqueLabels}
        setReload={setReload}
        dispatch={dispatch}
      /> */}
      <VoiceCallContentList
        isInitialMount={isInitialMount}
        isBelowSmScreen={isBelowSmScreen}
        isBelowLgScreen={isBelowLgScreen}
        reload={reload}
        areFilteredEmailsNone={areFilteredEmailsNone}
        searchTerm={searchTerm}
        selectedEmails={selectedEmails}
        dispatch={dispatch}
        store={store}
        sms={sms}
        folder={folder}
        setSelectedEmails={setSelectedEmails}
        setDrawerOpen={setDrawerOpen}
        handleToggleStarEmail={handleToggleStarEmail}
        handleSingleEmailDelete={handleSingleEmailDelete}
        handleToggleIsReadStatus={handleToggleIsReadStatus}
        setCurrentSMS={setCurrentSMS}
        voiceCallDeliveredStatus={voiceCallDeliveredStatus}
      />
      {
        currentSMS &&
        <VoiceCallDetails
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
          currentSMS={currentSMS}
          sms={sms}
          folder={folder}
          label={label}
          dispatch={dispatch}
          handleSingleEmailDelete={handleSingleEmailDelete}
          handleToggleIsReadStatus={handleToggleIsReadStatus}
          handleToggleStarEmail={handleToggleStarEmail}
        />
      }
    </div>
  )
}

VoiceCallContent.propTypes = {
  folder: PropTypes.any,
  label: PropTypes.any,
  store: PropTypes.any,
  dispatch: PropTypes.any,
  uniqueLabels: PropTypes.any,
  isInitialMount: PropTypes.any,
  setSidebarOpen: PropTypes.any,
  isBelowLgScreen: PropTypes.any,
  isBelowMdScreen: PropTypes.any,
  isBelowSmScreen: PropTypes.any,
  setBackdropOpen: PropTypes.any,
  voiceCallDeliveredStatus: PropTypes.any,
};
export default VoiceCallContent
