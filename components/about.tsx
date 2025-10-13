'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine, Bold, Italic, Strikethrough, Underline, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type, Link2, Image as ImageIcon, Code, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, Superscript, Subscript, List, ListOrdered, ListChecks, Minus, ChevronDown, Play, Palette } from 'lucide-react';

import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import SuperscriptExt from '@tiptap/extension-superscript';
import SubscriptExt from '@tiptap/extension-subscript';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Youtube from '@tiptap/extension-youtube';
import { Color, TextStyle } from '@tiptap/extension-text-style';

// --- Custom Image extension that persists a `width` attribute and renders it into inline style ---
interface CustomImageAttrs {
  src: string;
  alt?: string;
  width?: string; // supports values like "300px", "50%", etc.
}

// Type augmentation so the new command is visible to TypeScript
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      /** Insert an image accepting string-based width values (e.g. '300px', '50%'). */
      insertCustomImage: (attrs: CustomImageAttrs) => ReturnType;
    };
  }
}

const CustomImage = ImageExt.extend({
  addAttributes() {
    const base = typeof (this.parent as any) === 'function' ? (this.parent as any)() : {};
    return {
      ...base,
      width: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('width') || (element as HTMLElement).style?.width || null,
        renderHTML: (attrs: { width?: string | null }) => {
          const style = [
            'max-width: 100%',
            'height: auto',
            'display: inline-block',
            'margin: 0',
            attrs.width ? `width: ${attrs.width}` : null,
          ]
            .filter(Boolean)
            .join('; ');

          return { style } as Record<string, string>;
        },
      },
    };
  },
  addCommands() {
    return {
      // New command so we can type width as a string without fighting Image's SetImageOptions type
      insertCustomImage:
        (attrs: CustomImageAttrs) =>
          ({ chain }) => {
            return chain().insertContent({ type: this.name, attrs }).run();
          },
    };
  },
});

interface AboutProps {
  initialAbout: string | null;
  editable: boolean;
  updateAbout: (formData: FormData) => Promise<void>;
  backgroundColor?: string;
  backgroundColorCard?: string;
  backgroundColorMuted?: string;
  textColor?: string;
  textColorMuted?: string;
}

export default function About({ initialAbout, editable, updateAbout, backgroundColor, backgroundColorCard, backgroundColorMuted, textColor, textColorMuted }: AboutProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [aboutText, setAboutText] = useState(initialAbout || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [linkDialog, setLinkDialog] = useState(false);
  const [imageDialog, setImageDialog] = useState(false);
  const [youtubeDialog, setYoutubeDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [savePending, setSavePending] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      SuperscriptExt,
      SubscriptExt,
      LinkExt.configure({ openOnClick: false }),
      // Use the custom image extension; no static HTMLAttributes here because we render them via `renderHTML` above
      CustomImage.configure({
        inline: true,
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
      TextStyle,
      Color,
    ],
    content: aboutText,
    editable: false,
    immediatelyRender: false,
    onUpdate: () => {
      setHasUnsavedChanges(true);
    },
  });

  const toggleForm = () => {
    if (isFormVisible && hasUnsavedChanges) {
      setShowExitWarning(true);
      return;
    }

    setIsFormVisible(!isFormVisible);
    if (editor) {
      editor.setEditable(!isFormVisible);
      if (!isFormVisible) {
        editor.commands.setContent(aboutText);
        setHasUnsavedChanges(false);
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleExitEditor = () => {
    if (editor) {
      editor.commands.setContent(aboutText);
      editor.setEditable(false);
    }
    setIsFormVisible(false);
    setHasUnsavedChanges(false);
    setShowExitWarning(false);
  };

  const handleSave = async (formData: FormData) => {
    setSavePending(true);
    if (editor) {
      let content = editor.getHTML();
      // Remove trailing empty paragraphs
      content = content.replace(/(<p><\/p>|<p>\s*<\/p>)+$/g, '');
      setAboutText(content);
      const newFormData = new FormData();
      newFormData.append('about', content);
      await updateAbout(newFormData);
      editor.setEditable(false);
    }
    setIsFormVisible(false);
    setHasUnsavedChanges(false);
    setSavePending(false);
  };

  return (
    <>
      <h1>
        About Me {editable && <PencilLine onClick={toggleForm} className="cursor-pointer inline h-4 w-4" />}
      </h1>
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-foreground relative" style={{ ...(backgroundColorCard && { background: backgroundColorCard }), ...(backgroundColorMuted && { '--muted': backgroundColorMuted }) } as React.CSSProperties}>
        {isFormVisible && editor && (
          <>
            <div className="sticky top-14 z-10 p-3 border border-border rounded-lg bg-background/50 backdrop-blur-sm overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
              <div className="flex gap-1 justify-center min-w-max">
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}>
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}>
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-accent' : ''}>
                  <Underline className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-accent' : ''}>
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className={editor.isActive('heading') ? 'bg-accent' : ''}>
                      <Heading1 className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                      <Type className="h-4 w-4 mr-2" />
                      Normal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}>
                      <Heading1 className="h-4 w-4 mr-2" />
                      Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}>
                      <Heading2 className="h-4 w-4 mr-2" />
                      Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}>
                      <Heading3 className="h-4 w-4 mr-2" />
                      Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 4 }).run()}>
                      <Heading4 className="h-4 w-4 mr-2" />
                      Heading 4
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 5 }).run()}>
                      <Heading5 className="h-4 w-4 mr-2" />
                      Heading 5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setHeading({ level: 6 }).run()}>
                      <Heading6 className="h-4 w-4 mr-2" />
                      Heading 6
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Link2 className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setLinkDialog(true)}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setImageDialog(true)}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Image
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setYoutubeDialog(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      YouTube
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className={editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList') ? 'bg-accent' : ''}>
                      <List className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
                      <List className="h-4 w-4 mr-2" />
                      Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                      <ListOrdered className="h-4 w-4 mr-2" />
                      Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()}>
                      <ListChecks className="h-4 w-4 mr-2" />
                      Task List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-accent' : ''}>
                  <Quote className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-accent' : ''}>
                  <Code className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <AlignLeft className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                      <AlignLeft className="h-4 w-4 mr-2" />
                      Left
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                      <AlignCenter className="h-4 w-4 mr-2" />
                      Center
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                      <AlignRight className="h-4 w-4 mr-2" />
                      Right
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                      <AlignJustify className="h-4 w-4 mr-2" />
                      Justify
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={editor.isActive('superscript') ? 'bg-accent' : ''}>
                  <Superscript className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleSubscript().run()} className={editor.isActive('subscript') ? 'bg-accent' : ''}>
                  <Subscript className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                  <Minus className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Palette className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().unsetColor().run()}>
                      <div className="w-4 h-4 mr-2 border border-border rounded" />
                      Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setColor('#ef4444').run()}>
                      <div className="w-4 h-4 mr-2 bg-red-500 rounded" />
                      Red
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setColor('#3b82f6').run()}>
                      <div className="w-4 h-4 mr-2 bg-blue-500 rounded" />
                      Blue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setColor('#22c55e').run()}>
                      <div className="w-4 h-4 mr-2 bg-green-500 rounded" />
                      Green
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setColor('#f59e0b').run()}>
                      <div className="w-4 h-4 mr-2 bg-yellow-500 rounded" />
                      Yellow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().setColor('#8b5cf6').run()}>
                      <div className="w-4 h-4 mr-2 bg-purple-500 rounded" />
                      Purple
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <br /><Separator /><br />
          </>
        )}

        {!isFormVisible && !aboutText ? (
          <p className="text-muted-foreground" style={textColorMuted ? { color: textColorMuted } : {}}>No content has been provided.</p>
        ) : (
          <EditorContent
            editor={editor}
            style={{ ...(textColor && { color: textColor, '--foreground': textColor }), ...(textColorMuted && { '--muted-foreground': textColorMuted }) } as React.CSSProperties}
            className="prose-sm max-w-none
              [&>div]:outline-none [&>div]:min-h-[100px]
              [&>div>h1]:text-2xl [&>div>h1]:font-bold [&>div>h1]:mb-4 [&>div>h1]:mt-0
              [&>div>h2]:text-xl [&>div>h2]:font-semibold [&>div>h2]:mb-3 [&>div>h2]:mt-6
              [&>div>h3]:text-lg [&>div>h3]:font-medium [&>div>h3]:mb-2 [&>div>h3]:mt-4
              [&>div>h4]:text-base [&>div>h4]:font-medium [&>div>h4]:mb-2 [&>div>h4]:mt-3
              [&>div>h5]:text-sm [&>div>h5]:font-medium [&>div>h5]:mb-1 [&>div>h5]:mt-2
              [&>div>h6]:text-sm [&>div>h6]:font-medium [&>div>h6]:text-muted-foreground [&>div>h6]:mb-1 [&>div>h6]:mt-2
              [&>div>p]:mb-4 [&>div>p]:leading-relaxed
              [&>div>a]:text-primary [&>div>a]:underline [&>div>a]:underline-offset-4 hover:[&>div>a]:text-primary/80
              [&_a]:underline [&>div>u]:underline
              [&>div>ul]:mb-4 [&>div>ul]:pl-6 [&>div>ul]:list-disc [&>div>li]:mb-1
              [&>div>ol]:mb-4 [&>div>ol]:pl-6 [&>div>ol]:list-decimal
              [&>div>ul[data-type='taskList']]:list-none [&>div>ul[data-type='taskList']]:pl-0
              [&>div>ul[data-type='taskList']>li]:flex [&>div>ul[data-type='taskList']>li]:items-center [&>div>ul[data-type='taskList']>li]:gap-2 [&>div>ul[data-type='taskList']>li]:mb-1
              [&>div>ul[data-type='taskList']>li>label]:flex [&>div>ul[data-type='taskList']>li>label]:items-center [&>div>ul[data-type='taskList']>li>label]:cursor-pointer
              [&>div>ul[data-type='taskList']>li>label>input[type='checkbox']]:peer [&>div>ul[data-type='taskList']>li>label>input[type='checkbox']]:sr-only
              [&>div>ul[data-type='taskList']>li>label]:before:content-[''] [&>div>ul[data-type='taskList']>li>label]:before:h-4 [&>div>ul[data-type='taskList']>li>label]:before:w-4 [&>div>ul[data-type='taskList']>li>label]:before:rounded-sm [&>div>ul[data-type='taskList']>li>label]:before:border [&>div>ul[data-type='taskList']>li>label]:before:border-primary [&>div>ul[data-type='taskList']>li>label]:before:mr-2 [&>div>ul[data-type='taskList']>li>label]:before:flex [&>div>ul[data-type='taskList']>li>label]:before:items-center [&>div>ul[data-type='taskList']>li>label]:before:justify-center [&>div>ul[data-type='taskList']>li>label]:before:text-primary-foreground [&>div>ul[data-type='taskList']>li>label]:before:text-xs
              [&>div>ul[data-type='taskList']>li>label:has(input:checked)]:before:bg-primary [&>div>ul[data-type='taskList']>li>label:has(input:checked)]:before:content-'✓'
              [&>div>ul[data-type='taskList']>li>div]:flex-1 [&>div>ul[data-type='taskList']>li>div>p]:mb-0 [&>div>ul[data-type='taskList']>li>div>p]:mt-0
              [&>div>blockquote]:border-l-4 [&>div>blockquote]:text-muted-foreground [&>div>blockquote]:border-border [&>div>blockquote]:pl-4 [&>div>blockquote]:italic [&>div>blockquote]:mb-4
              [&>div>code]:bg-muted [&>div>code]:px-1.5 [&>div>code]:py-0.5 [&>div>code]:rounded [&>div>code]:text-sm [&>div>code]:font-mono
              [&>div>pre]:bg-muted [&>div>pre]:p-4 [&>div>pre]:rounded-lg [&>div>pre]:overflow-x-auto [&>div>pre]:mb-4
              [&>div>pre>code]:bg-transparent [&>div>pre>code]:p-0

              [&>div>hr]:border-border [&>div>hr]:my-6
              [&>div>img]:max-w-full [&>div>img]:inline-block

              [&>div>strong]:font-semibold
              [&>div>em]:italic
              [&>div>sup]:text-xs [&>div>sup]:align-super
              [&>div>sub]:text-xs [&>div>sub]:align-sub
              [&>div>*:last-child]:mb-0"
          />
        )}

        {isFormVisible && (
          <>
            <br /><Separator /><br />
            <form className="flex flex-col gap-3" ref={formRef} action={handleSave}>
              <Button type="submit" disabled={savePending} aria-disabled={savePending}>
                {savePending ? 'Saving changes…' : 'Save changes'}
              </Button>
            </form>
          </>
        )}

        {/* Link Dialog */}
        <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <Button onClick={() => {
                if (linkUrl) {
                  editor?.chain().focus().setLink({ href: linkUrl }).run();
                  setLinkUrl('');
                  setLinkDialog(false);
                }
              }}>Add Link</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Dialog */}
        <Dialog open={imageDialog} onOpenChange={setImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <Label htmlFor="image-alt">Alt text (optional)</Label>
                <Input id="image-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Description of the image" />
              </div>
              <div>
                <Label htmlFor="image-width">Width (optional)</Label>
                <Input id="image-width" value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} placeholder="300px or 50%" />
              </div>
              <Button onClick={() => {
                if (imageUrl) {
                  const attrs: { src: string; alt?: string; width?: string } = {
                    src: imageUrl,
                    alt: imageAlt || undefined,
                    ...(imageWidth && { width: imageWidth }),
                  };
                  editor?.chain().focus().insertCustomImage(attrs as CustomImageAttrs).run();
                  setImageUrl('');
                  setImageAlt('');
                  setImageWidth('');
                  setImageDialog(false);
                }
              }}>Add Image</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* YouTube Dialog */}
        <Dialog open={youtubeDialog} onOpenChange={setYoutubeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add YouTube Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input id="youtube-url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <Button onClick={() => {
                if (youtubeUrl) {
                  editor?.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
                  setYoutubeUrl('');
                  setYoutubeDialog(false);
                }
              }}>Add Video</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exit warning */}
        <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to exit the editor? Your changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleExitEditor}>Exit Without Saving</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}