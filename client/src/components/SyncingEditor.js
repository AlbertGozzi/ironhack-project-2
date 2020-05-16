import React, { useCallback, useRef, useEffect } from 'react';
import { Editor, Transforms, Range} from 'slate';
import { Slate, Editable, ReactEditor, useSlate } from 'slate-react';
import { useSelected, useFocused } from 'slate-react';
import isHotkey from 'is-hotkey';
import { css } from 'emotion';

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline'
};

export const SyncingEditor = (props) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  return ( 
    <div>
      <Slate 
        editor={props.editor} 
        value={props.value}
        onChange={value => {
          console.log('Applied operation - Locally')
          props.setValue(value);

          let isRemoteOperation = [...props.editor.operations].map(op => op.source).join('').length !== 0;
          if (!isRemoteOperation) {
            // Create object to emit
            const ops = props.editor.operations
              .filter(o => {
                if (o) {
                  return (
                    o.type !== "set_selection" &&
                    // o.type !== "set_value" &&
                    !o.source
                  );
                }
                return false;
              })
              .map((o) => ({ ...o, source: props.socket.id }));  
  
            // console.log(ops);

            // Emit object
            if (ops.length && !isRemoteOperation) {
              console.log('Emitted operation')
              props.socket.emit('new-operations', {
                editorId: props.socket.id, 
                ops: ops,
                value: value,
                docId: props.docId
              })
            }      
          }
        }} 
      >
        <div className="toolbar">
          <MarkButton format="bold" icon="fas fa-bold"/>
          <MarkButton format="italic" icon="fas fa-italic"/>
          <MarkButton format="underline" icon="fas fa-underline"/>
          <BlockButton format="heading-one" icon="fas fa-heading" />
          <BlockButton format="heading-two" icon="fas fa-heading" />
          <BlockButton format="block-quote" icon="fas fa-quote-left" />
          <BlockButton format="numbered-list" icon="fas fa-list-ol" />
          <BlockButton format="bulleted-list" icon="fas fa-list" />
        </div>
        <HoveringToolbar />
        <Editable 
          className="editor" 
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault()
                const mark = HOTKEYS[hotkey]
                toggleMark(props.editor, mark)
              }
            }
          }}
        />
      </Slate>
    </div>
  );
}

const HoveringToolbar = () => {
  const ref = useRef()
  const editor = useSlate()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`
  })

  return (
    <div ref={ref} className="hoveringMenu">
      <HoverButton format="theory" label="Add to Summary" />
      <HoverButton format="verb" label="Add to Verb List" />
      <HoverButton format="translate" label="Translate" />
    </div>
  )
}

const toggleBlock = (editor, format) => {

  console.log(editor.children)
  console.log(`Format: ${format}`)

  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  console.log(`isActive: ${isActive}`)
  console.log(`isList: ${isList}`)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })
  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      )
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      )
    case 'image':
      return <ImageElement {...props} />
  }
}

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected()
  const focused = useFocused()
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        className={css`
          display: block;
          max-width: 100%;
          max-height: 20em;
          box-shadow: ${selected && focused ? '0 0 0 2px grey;' : 'none'};
        `}
        alt={element.url}
      />
    </div>
  )
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.theory) { 
    children = <span className="theory">{children}</span>
  }

  if (leaf.verb) { 
    children = <span className="verb">{children}</span>
  }

  if (leaf.translate) { 
    children = <span className="translate">{children}</span>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <button
      className={`toolbarButton ${isBlockActive(editor, format).toString()}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <i className={icon}></i>
    </button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <button
      className={`toolbarButton toolbarButton${isMarkActive(editor, format).toString()}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <i className={icon}></i>
    </button>
  )
}

const HoverButton = ({ format, label }) => {
  const editor = useSlate()
  return (
    <button
      className={`hoverButton hoverButton${isMarkActive(editor, format).toString()}`}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      {label}
    </button>
  )
}