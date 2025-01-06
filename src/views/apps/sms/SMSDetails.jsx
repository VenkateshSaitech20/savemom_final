import { useState } from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material';
import classnames from 'classnames';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { moveEmailsToFolder, navigateEmails, toggleLabel } from '@/redux-store/slices/email';
import CustomIconButton from '@core/components/mui/IconButton';
import OptionMenu from '@core/components/option-menu';
import DirectionalIcon from '@components/DirectionalIcon';
import SMSCard from './SMSCard';
import styles from './styles.module.css';
import { labelColors } from './SidebarLeft';

const ScrollWrapper = ({ children, isBelowLgScreen }) => {
    if (isBelowLgScreen) {
        return <div className='bs-full overflow-y-auto overflow-x-hidden bg-actionHover'>{children}</div>
    } else {
        return (
            <PerfectScrollbar className='bg-actionHover' options={{ wheelPropagation: false }}>
                {children}
            </PerfectScrollbar>
        )
    }
}

const DetailsDrawer = styled('div')(({ drawerOpen }) => ({
    display: 'flex',
    flexDirection: 'column',
    blockSize: '100%',
    inlineSize: '100%',
    position: 'absolute',
    top: 0,
    right: drawerOpen ? 0 : '-100%',
    zIndex: 11,
    overflow: 'hidden',
    background: 'var(--mui-palette-background-paper)',
    transition: 'right 0.3s ease'
}))

const EditorToolbar = ({ editor }) => {
    if (!editor) {
        return null
    }

    return (
        <div className='flex flex-wrap gap-x-3 gap-y-1 pli-6'>
            <CustomIconButton
                {...(editor.isActive('bold') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <i className={classnames('bx-bold', { 'text-textPrimary': !editor.isActive('bold') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('underline') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <i className={classnames('bx-underline', { 'text-textPrimary': !editor.isActive('underline') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('italic') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <i className={classnames('bx-italic', { 'text-textPrimary': !editor.isActive('italic') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('strike') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <i className={classnames('bx-strikethrough', { 'text-textPrimary': !editor.isActive('strike') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <i className={classnames('bx-align-left', { 'text-textPrimary': !editor.isActive({ textAlign: 'left' }) })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <i
                    className={classnames('bx-align-middle', {
                        'text-textPrimary': !editor.isActive({ textAlign: 'center' })
                    })}
                />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <i
                    className={classnames('bx-align-right', {
                        'text-textPrimary': !editor.isActive({ textAlign: 'right' })
                    })}
                />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
                <i
                    className={classnames('bx-align-justify', {
                        'text-textPrimary': !editor.isActive({ textAlign: 'justify' })
                    })}
                />
            </CustomIconButton>
        </div>
    )
}

const SMSDetails = props => {
    // Props
    const {
        drawerOpen,
        setDrawerOpen,
        isBelowSmScreen,
        isBelowLgScreen,
        currentSMS,
        sms,
        folder,
        label,
        dispatch,
        handleSingleEmailDelete,
        handleToggleIsReadStatus,
        handleToggleStarEmail
    } = props

    const [reply, setReply] = useState(false)

    // Close drawer and reset reply state
    const handleCloseDrawer = () => {
        setDrawerOpen(false)
        if (reply) {
            setReply(false)
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your message...'
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph']
            }),
            Underline
        ],
        immediatelyRender: false
    })

    return (
        <DetailsDrawer drawerOpen={drawerOpen}>
            {currentSMS && (
                <>
                    <div className='plb-4 pli-6'>
                        <div className='flex justify-between gap-2'>
                            <div className='flex gap-2 items-center overflow-hidden'>
                                <IconButton onClick={handleCloseDrawer}>
                                    <DirectionalIcon
                                        ltrIconClass='bx-chevron-left'
                                        rtlIconClass='bx-chevron-right'
                                        className='text-textSecondary'
                                    />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
                        <div className='plb-5 sm:pli-8 pli-4 flex flex-col gap-4'>
                            <div>
                                <SMSCard data={currentSMS} isReplies={true} />
                            </div>
                        </div>
                    </ScrollWrapper>
                </>
            )}
        </DetailsDrawer>
    )
}

export default SMSDetails
