import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { CodeBlock } from '@tiptap/extension-code-block';
import CustomIconButton from '@core/components/mui/IconButton';
import classnames from 'classnames';
import '@/libs/styles/tiptapEditor.css';
import { Button } from '@mui/material';

const EditorToolbar = ({ editor }) => {
    if (!editor) {
        return null
    }

    return (
        <div className='flex flex-wrap gap-x-3 gap-y-1 plb-2 pli-4' style={{ backgroundColor: '#f0f0f0', padding: '10px', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
            <CustomIconButton
                {...(editor.isActive('bold') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleBold().run()}
            >
                <i className={classnames('bx-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('underline') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
                <i className={classnames('bx-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('italic') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleItalic().run()}
            >
                <i className={classnames('bx-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('strike') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleStrike().run()}
            >
                <i className={classnames('bx-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <i className={classnames('bx-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <i
                    className={classnames('bx-align-middle', {
                        'text-textSecondary': !editor.isActive({ textAlign: 'center' })
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
                        'text-textSecondary': !editor.isActive({ textAlign: 'right' })
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
                        'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
                    })}
                />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('code') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleCode().run()}
            >
                <i className={classnames('bx-code', { 'text-textSecondary': !editor.isActive('code') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('paragraph') && { color: 'primary' })} // Check for paragraph active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setParagraph().run()}
            >
                <i className={classnames('bx-paragraph', { 'text-textSecondary': !editor.isActive('paragraph') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 1 }) && { color: 'primary' })} // Check for H1 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 1 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>1</span>
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 2 }) && { color: 'primary' })} // Check for H2 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 2 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>2</span>
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 3 }) && { color: 'primary' })} // Check for H3 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 3 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>3</span>
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 4 }) && { color: 'primary' })} // Check for H4 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 4 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>4</span>
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 5 }) && { color: 'primary' })} // Check for H5 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 5 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>5</span>
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('heading', { level: 6 }) && { color: 'primary' })} // Check for H6 active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            >
                <i className={classnames('bx-heading', { 'text-textSecondary': !editor.isActive('heading', { level: 6 }) })} />
                <span style={{ fontSize: '14px', top: '3px', position: 'relative', left: '-3px' }}>6</span>
            </CustomIconButton>
            <CustomIconButton
                variant='tonal'
                size='small'
                onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
            >
                <i className={classnames('bx bx-link', { 'text-textSecondary': !editor.isActive('link') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('bulletList') && { color: 'primary' })} // Check for Bullet List active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
                <i className={classnames('bx-list-ul', { 'text-textSecondary': !editor.isActive('bulletList') })} />
            </CustomIconButton>
            <CustomIconButton
                {...(editor.isActive('orderedList') && { color: 'primary' })} // Check for Ordered List active state
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <i className={classnames('bx-list-ol', { 'text-textSecondary': !editor.isActive('orderedList') })} />
            </CustomIconButton>
            {/* <CustomIconButton
                {...(editor.isActive('codeBlock') && { color: 'primary' })}
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <i className={classnames('bx-code-block', { 'text-textSecondary': !editor.isActive('codeBlock') })} />
            </CustomIconButton> */}
            <CustomIconButton
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().setHardBreak().run()}
            >
                <i className="bx bx-underline" />
            </CustomIconButton>
            <CustomIconButton
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().undo().run()}
            >
                <i className="bx bx-undo" />
            </CustomIconButton>
            <CustomIconButton
                variant='tonal'
                size='small'
                onClick={() => editor.chain().focus().redo().run()}
            >
                <i className="bx bx-redo" />
            </CustomIconButton>
            <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'is-active' : ''}
                style={{ color: '#5f6973' }}
            >
                Blockquote
            </Button>
            <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} style={{ color: '#5f6973' }}>
                Horizontal rule
            </Button>
        </div >
    )
}

const EditorComponent = React.forwardRef(({ placeholder, data }, ref) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Underline,
            Link,
            CodeBlock
        ],
        immediatelyRender: false,
    });

    React.useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || '',
        clearContent: () => editor?.commands.clearContent(),
    }));

    useEffect(() => {
        if (editor && data) {
            editor.commands.setContent(data);
        }
    }, [data, editor]);

    return (
        <div>
            <EditorToolbar editor={editor} />
            <EditorContent
                editor={editor}
                className='bs-[300px] overflow-y-auto'
                style={{ border: '1px solid #ced1d4', borderRadius: '4px', color: '#384451' }}
            />
        </div>
    );
});

export default EditorComponent;
