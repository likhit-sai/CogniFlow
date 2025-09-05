
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PageItem, AiAction, ItemType, Slide, PaperStyle, PresentationTheme } from '../types';
import { generateAiText, generatePresentation, transcribeAudio, recognizeHandwriting } from '../services/geminiService';
import Icon from './Icon';
import TableView from './database/TableView';
import GalleryView from './database/GalleryView';
import CalendarView from './database/CalendarView';
import YouTubeEmbed from './embeds/YouTubeEmbed';
import SpotifyEmbed from './embeds/SpotifyEmbed';

interface EditorProps {
  item: PageItem | null;
  childPages: PageItem[];
  onUpdate: (id: string, updates: Partial<PageItem>) => void;
  onCreate: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean; properties?: Record<string, any>, content?: string }) => void;
  onSelectItem: (id: string) => void;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

const AiActionBar: React.FC<{ onAction: (action: AiAction) => void; isLoading: boolean }> = ({ onAction, isLoading }) => {
    const actions = [
        { name: 'summarize', label: 'Summarize', icon: 'summarize', description: 'Create a concise summary.' },
        { name: 'improve', label: 'Improve', icon: 'improve', description: 'Fix grammar and improve clarity.' },
        { name: 'brainstorm', label: 'Brainstorm', icon: 'brainstorm', description: 'Expand on the topic.' },
    ] as const;
    return (
        <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-2 flex items-center gap-1">
            <Icon name="sparkles" className="w-5 h-5 text-accent mx-1" />
            {actions.map(({ name, label, icon, description }) => (
                <button key={name} onClick={() => onAction(name as AiAction)} disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 disabled:opacity-50 transition-all text-sm"
                    title={description}>
                    <Icon name={icon} className="w-4 h-4 text-text-dim" />
                    <span className="text-text">{label}</span>
                </button>
            ))}
        </div>
    );
};

const TEXT_COLORS = [
  { name: 'Default', value: 'inherit', class: 'bg-text' },
  { name: 'Bright White', value: '#FFFFFF', class: 'bg-white' },
  { name: 'White', value: '#FAFAFA', class: 'bg-neutral-50' },
  { name: 'Light Gray', value: '#E5E5E5', class: 'bg-neutral-200' },
  { name: 'Gray', value: '#A3A3A3', class: 'bg-neutral-400' },
  { name: 'Urgent', value: '#FCA5A5', class: 'bg-red-400' },
] as const;

interface FormattingToolbarProps {
  onColorSelect: (color: string) => void;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onColorSelect }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
            setIsPaletteOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorClick = (color: string) => {
    onColorSelect(color);
    setIsPaletteOpen(false);
  }
  
  return (
    <div className="relative" ref={paletteRef}>
      <button
        onClick={() => setIsPaletteOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm"
        title="Change text color"
      >
        <Icon name="palette" className="w-4 h-4 text-text-dim" />
      </button>
      {isPaletteOpen && (
        <div className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-lg shadow-lg z-10 p-2 grid grid-cols-3 gap-2">
          {TEXT_COLORS.map(color => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => handleColorClick(color.value)}
              className={`w-6 h-6 rounded-full border-2 border-transparent hover:border-white ${color.class}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const paperStyles: { name: PaperStyle; label: string; icon: 'page-plain' | 'page-lined' | 'page-grid' | 'page-dotted' | 'page-four-line' }[] = [
    { name: 'plain', label: 'Plain', icon: 'page-plain' },
    { name: 'lined', label: 'Lined', icon: 'page-lined' },
    { name: 'grid', label: 'Grid', icon: 'page-grid' },
    { name: 'dotted', label: 'Dotted', icon: 'page-dotted' },
    { name: 'four-line', label: 'Four Line', icon: 'page-four-line' },
];

const PaperStyleSelector: React.FC<{ currentStyle: PaperStyle, onStyleChange: (style: PaperStyle) => void }> = ({ currentStyle, onStyleChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const currentIcon = paperStyles.find(s => s.name === currentStyle)?.icon || 'page-plain';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} title="Change Paper Style" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm">
                <Icon name={currentIcon} className="w-4 h-4 text-text-dim" />
            </button>
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-40 bg-surface border border-border rounded-lg shadow-2xl z-10 p-1">
                    {paperStyles.map(({ name, label, icon }) => (
                        <button key={name} onClick={() => { onStyleChange(name); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-text hover:bg-white/5 rounded-md">
                            <Icon name={icon} className="w-4 h-4 text-text-dim" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const embedRegex = /@\[(youtube|spotify)\]\((https?:\/\/[^)]+)\)/g;
const parseContent = (text: string = '') => {
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = embedRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
        }
        parts.push({ type: match[1] as 'youtube' | 'spotify', url: match[2] });
        lastIndex = embedRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts;
};

const PageEditor: React.FC<Pick<EditorProps, 'item' | 'onUpdate'>> = ({ item, onUpdate }) => {
    const [content, setContent] = useState(item?.content || '');
    const [aiLoading, setAiLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('edit');
    const debounceTimeout = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { setContent(item?.content || ''); }, [item]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            if (item) onUpdate(item.id, { content: newContent });
        }, 500);
    };
    
    const applyColor = useCallback((color: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        if (start === end) return;

        const selectedText = content.substring(start, end);
        const coloredText = color === 'inherit' 
            ? selectedText 
            : `<span style="color:${color};">${selectedText}</span>`;
        
        const newContent = content.substring(0, start) + coloredText + content.substring(end);

        setContent(newContent);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        if (item) onUpdate(item.id, { content: newContent });

        setTimeout(() => {
            textarea.focus();
            const newSelectionStart = start + coloredText.length;
            textarea.setSelectionRange(newSelectionStart, newSelectionStart);
        }, 0);
    }, [content, item, onUpdate]);

    const handleAiAction = useCallback(async (action: AiAction) => {
        if (!item || !content) return;
        setAiLoading(true);
        try {
            const aiResult = await generateAiText(action, content);
            const newContent = `${content}\n\n---\n\n**✨ AI ${action}:**\n\n${aiResult}`;
            setContent(newContent);
            onUpdate(item.id, { content: newContent });
        } finally {
            setAiLoading(false);
        }
    }, [item, content, onUpdate]);

    const parsedContent = useMemo(() => parseContent(content), [content]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {viewMode === 'edit' && <FormattingToolbar onColorSelect={applyColor} />}
                </div>
                 <button 
                    onClick={() => setViewMode(prev => prev === 'edit' ? 'view' : 'edit')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm"
                >
                     <Icon name={viewMode === 'edit' ? 'eye' : 'edit'} className="w-4 h-4 text-text-dim" />
                     <span className="text-text">{viewMode === 'edit' ? 'View Mode' : 'Edit Mode'}</span>
                 </button>
            </div>
            <div className="flex-1 relative overflow-y-auto">
                {viewMode === 'edit' ? (
                    <>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            className="flex-1 p-8 bg-transparent text-text resize-none focus:outline-none w-full h-full text-base absolute inset-0 leading-relaxed"
                            placeholder="Start writing..."
                        />
                        <AiActionBar onAction={handleAiAction} isLoading={aiLoading}/>
                    </>
                ) : (
                    <div className="p-8 text-text prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-accent prose-blockquote:border-border prose-code:bg-surface prose-code:rounded-md prose-code:px-1.5 prose-code:py-1">
                        {parsedContent.map((part, index) => {
                            if (part.type === 'text') {
                                return <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{part.content}</ReactMarkdown>;
                            }
                            if (part.type === 'youtube') {
                                return <YouTubeEmbed key={index} url={part.url} />;
                            }
                            if (part.type === 'spotify') {
                                return <SpotifyEmbed key={index} url={part.url} />;
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const MeetingEditor: React.FC<Pick<EditorProps, 'item' | 'onUpdate'>> = ({ item, onUpdate }) => {
    const [content, setContent] = useState(item?.content || '');
    const debounceTimeout = useRef<number | null>(null);

    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<number | null>(null);

    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { setContent(item?.content || ''); }, [item]);
    
    useEffect(() => {
        // Cleanup timer and recorder on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            if (item) onUpdate(item.id, { content: newContent });
        }, 500);
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const startRecording = async () => {
        setError(null);
        setAudioURL(null);
        audioChunksRef.current = [];
        setElapsedTime(0);
        if (timerRef.current) clearInterval(timerRef.current);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                
                mediaRecorderRef.current.onstop = () => {
                    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                    const url = URL.createObjectURL(audioBlob);
                    setAudioURL(url);
                    audioChunksRef.current = [];
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorderRef.current.start();
                setRecordingStatus('recording');
                timerRef.current = window.setInterval(() => {
                    setElapsedTime(prev => prev + 1);
                }, 1000);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setError("Microphone access denied. Please allow microphone permissions in your browser settings.");
            }
        } else {
            setError("Audio recording is not supported in your browser.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.stop();
            setRecordingStatus('stopped');
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleTranscribe = async () => {
        if (!audioURL || !item) return;

        setError(null);
        setIsTranscribing(true);
        
        try {
            const response = await fetch(audioURL);
            const audioBlob = await response.blob();
            
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                try {
                    const base64Audio = reader.result as string;
                    const transcription = await transcribeAudio(base64Audio, audioBlob.type);
                    
                    const newContent = `${content}\n\n---\n\n### 🎙️ AI Transcription\n\n${transcription}`;
                    setContent(newContent);
                    onUpdate(item.id, { content: newContent });
                    
                    setAudioURL(null);
                    setRecordingStatus('idle');
                    setIsTranscribing(false);
                } catch(err) {
                     console.error("Transcription failed:", err);
                    const message = err instanceof Error ? err.message : "An unknown error occurred.";
                    setError(`Transcription failed: ${message}`);
                    setIsTranscribing(false);
                }
            };
            reader.onerror = () => {
                throw new Error("Failed to read audio file.");
            }
        } catch (err) {
            console.error("Transcription preparation failed:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Transcription failed: ${message}`);
            setIsTranscribing(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-2 border-b border-border flex items-center justify-end">
                <div className="flex items-center gap-2">
                    {recordingStatus !== 'recording' ? (
                        <button onClick={startRecording} disabled={isTranscribing} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm disabled:opacity-50">
                            <Icon name="microphone" className="w-4 h-4 text-text-dim" /> Record
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-lg text-red-300 tabular-nums">{formatTime(elapsedTime)}</span>
                            <button onClick={stopRecording} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors text-sm">
                                <Icon name="stop" className="w-4 h-4" /> Stop
                            </button>
                        </div>
                    )}
                    <button 
                        onClick={handleTranscribe} 
                        disabled={!audioURL || isTranscribing || recordingStatus === 'recording'} 
                        className="flex items-center justify-center gap-2 px-3 py-1.5 bg-accent text-primary rounded-md hover:bg-accent-hover transition-colors text-sm font-semibold disabled:opacity-50 min-w-[140px]"
                    >
                        {isTranscribing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Transcribing...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="sparkles" className="w-4 h-4" />
                                <span>Transcribe</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && <div className="p-2 bg-danger/20 text-danger text-sm text-center">{error}</div>}

            {audioURL && (
                <div className="p-4 border-b border-border">
                    <p className="text-xs text-text-dim mb-2">Recorded Audio:</p>
                    <audio src={audioURL} controls className="w-full h-10" />
                </div>
            )}
            
            <div className="flex-1 relative overflow-y-auto">
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    className="flex-1 p-8 bg-transparent text-text resize-none focus:outline-none w-full h-full text-base absolute inset-0 leading-relaxed"
                    placeholder="Meeting notes..."
                />
            </div>
        </div>
    );
};

const SketchEditor: React.FC<{ 
  item: PageItem, 
  onUpdate: (id: string, updates: Partial<PageItem>) => void,
  onCreate: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean; content?: string }) => void 
}> = ({ item, onUpdate, onCreate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number, y: number } | null>(null);
    const debounceTimeout = useRef<number | null>(null);

    const [color, setColor] = useState('#FAFAFA');
    const [lineWidth, setLineWidth] = useState(5);
    const [mode, setMode] = useState<'draw' | 'erase'>('draw');
    const paperStyle = item.paperStyle || 'plain';
    
    const [isConverting, setIsConverting] = useState(false);
    const [convertedText, setConvertedText] = useState<string | null>(null);
    const [conversionError, setConversionError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const saveCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            onUpdate(item.id, { content: dataUrl });
        }, 800);
    }, [item.id, onUpdate]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                const { width, height } = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    contextRef.current = ctx;

                    // Redraw canvas content after resize
                    const img = new Image();
                    img.src = item.content || '';
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, width, height);
                    };
                }
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [item.content]);

    const getPointerPos = (e: PointerEvent): { x: number, y: number } => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const draw = useCallback((e: PointerEvent) => {
        if (!isDrawingRef.current || !contextRef.current) return;
        const ctx = contextRef.current;
        const pos = getPointerPos(e);
        
        ctx.globalCompositeOperation = mode === 'draw' ? 'source-over' : 'destination-out';
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth * (e.pointerType === 'pen' ? e.pressure : 1);
        
        ctx.beginPath();
        if(lastPointRef.current) {
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        }
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastPointRef.current = pos;
    }, [color, lineWidth, mode]);

    const handlePointerDown = useCallback((e: PointerEvent) => {
        isDrawingRef.current = true;
        lastPointRef.current = getPointerPos(e);
        draw(e);
    }, [draw]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        draw(e);
    }, [draw]);
    
    const handlePointerUp = useCallback(() => {
        isDrawingRef.current = false;
        lastPointRef.current = null;
        saveCanvas();
    }, [saveCanvas]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointerleave', handlePointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerUp);
        };
    }, [handlePointerDown, handlePointerMove, handlePointerUp]);

    const clearCanvas = () => {
        if (contextRef.current && canvasRef.current) {
            const { width, height } = canvasRef.current;
            contextRef.current.clearRect(0, 0, width, height);
            saveCanvas();
        }
    };

    const handleConvertToText = async () => {
      if (!item.content) return;
      setIsConverting(true);
      setConvertedText(null);
      setConversionError(null);
      try {
        const text = await recognizeHandwriting(item.content);
        setConvertedText(text);
      } catch (e) {
        setConversionError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsConverting(false);
      }
    };
    
    const handleCopyText = () => {
      if (!convertedText) return;
      navigator.clipboard.writeText(convertedText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    };

    const handleCreatePageFromText = () => {
      if (!convertedText) return;
      const pageName = convertedText.split('\n')[0].substring(0, 50).trim() || 'Handwritten Note';
      onCreate(pageName, 'page', item.parentId, { content: convertedText, setActive: true });
      setConvertedText(null);
      setConversionError(null);
    };

    const COLORS = ['#FAFAFA', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#A855F7'];

    return (
        <div className={`relative w-full h-full overflow-hidden paper-background paper-${paperStyle}`}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-2 flex items-center gap-4">
                <PaperStyleSelector currentStyle={paperStyle} onStyleChange={(style) => onUpdate(item.id, { paperStyle: style })} />
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                    {COLORS.map(c => (
                        <button key={c} onClick={() => { setColor(c); setMode('draw'); }} className={`w-6 h-6 rounded-full border-2 ${color === c && mode === 'draw' ? 'border-accent' : 'border-transparent'}`} style={{ backgroundColor: c }}/>
                    ))}
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <Icon name="brush" className={`w-5 h-5 ${mode === 'draw' ? 'text-accent' : 'text-text-dim'}`} />
                    <input 
                        type="range"
                        min="1"
                        max="50"
                        value={lineWidth}
                        onChange={e => setLineWidth(Number(e.target.value))}
                        onPointerDown={() => setMode('draw')}
                        className="w-24"
                    />
                </div>
                <div className="h-6 w-px bg-border" />
                <button onClick={() => setMode(prev => prev === 'erase' ? 'draw' : 'erase')} className={`p-2 rounded-md ${mode === 'erase' ? 'bg-accent-subtle' : ''}`}>
                    <Icon name="eraser" className={`w-5 h-5 ${mode === 'erase' ? 'text-accent' : 'text-text-dim'}`} />
                </button>
                <button onClick={clearCanvas} className="p-2 rounded-md hover:bg-white/10">
                    <Icon name="trash" className="w-5 h-5 text-danger" />
                </button>
                 <div className="h-6 w-px bg-border" />
                 <button
                    onClick={handleConvertToText}
                    disabled={isConverting || !item.content}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm disabled:opacity-50 min-w-[120px]"
                    title="Convert handwriting to text"
                 >
                    {isConverting ? (
                        <svg className="animate-spin h-4 w-4 text-text-dim" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <Icon name="text-recognition" className="w-5 h-5 text-text-dim" />
                    )}
                    <span>{isConverting ? 'Converting...' : 'To Text'}</span>
                 </button>
            </div>
            
            {(convertedText !== null || conversionError) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center" onClick={() => { setConvertedText(null); setConversionError(null); }}>
                    <div className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-lg border border-border" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-text-bright mb-2">
                            {conversionError ? 'Conversion Failed' : 'Handwriting Recognition Result'}
                        </h3>
                        {conversionError ? (
                            <p className="text-danger bg-danger/10 p-3 rounded-md">{conversionError}</p>
                        ) : (
                            <textarea
                                readOnly
                                value={convertedText || ''}
                                className="w-full h-48 bg-primary border border-border rounded-md p-2 text-text-dim text-sm my-4 resize-none focus:outline-none"
                                placeholder="No text was recognized."
                            />
                        )}
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => { setConvertedText(null); setConversionError(null); }} className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 text-text hover:bg-white/20 transition-colors">Close</button>
                            {!conversionError && convertedText && (
                                <>
                                    <button onClick={handleCopyText} className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 text-text hover:bg-white/20 transition-colors min-w-[110px]">
                                        {copySuccess ? 'Copied!' : 'Copy Text'}
                                    </button>
                                    <button onClick={handleCreatePageFromText} className="px-4 py-2 text-sm font-semibold rounded-md bg-accent text-primary hover:bg-accent-hover transition-colors">Create Page</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const DatabaseEditor: React.FC<Pick<EditorProps, 'item' | 'childPages' | 'onUpdate' | 'onCreate'> & { onSelectItem: (id: string) => void }> = ({ item, childPages, onUpdate, onCreate, onSelectItem }) => {
    if (!item?.activeViewId || !item.views) return null;

    const activeView = item.views.find(v => v.id === item.activeViewId);
    
    const handleViewChange = (viewId: string) => {
        onUpdate(item.id, { activeViewId: viewId });
    }

    const renderView = () => {
        switch (activeView?.type) {
            case 'table':
                return <TableView database={item} pages={childPages} onUpdatePage={onUpdate} onCreatePage={onCreate} onSelectItem={onSelectItem}/>;
            case 'gallery':
                return <GalleryView database={item} pages={childPages} onUpdatePage={onUpdate} onCreatePage={onCreate} onSelectItem={onSelectItem}/>;
            case 'calendar':
                return <CalendarView database={item} pages={childPages} onCreatePage={onCreate} onSelectItem={onSelectItem}/>;
            default:
                return <div className="p-8 text-text-dim">Unknown view type.</div>;
        }
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="px-4 border-b border-border flex-shrink-0 flex items-center gap-2">
                {item.views.map(view => (
                    <button 
                        key={view.id} 
                        onClick={() => handleViewChange(view.id)}
                        className={`flex items-center gap-2 py-3 px-2 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none -mb-px ${
                            activeView?.id === view.id 
                                ? 'border-accent text-text-bright' 
                                : 'border-transparent text-text-dim hover:border-border-hover hover:text-text'
                        }`}
                        aria-current={activeView?.id === view.id ? 'page' : undefined}
                    >
                        <Icon name={view.type} className="w-5 h-5" />
                        <span>{view.name}</span>
                    </button>
                ))}
            </div>
            {renderView()}
        </div>
    )
};

const SpreadsheetEditor: React.FC<{ item: PageItem, onUpdate: (id: string, updates: Partial<PageItem>) => void }> = ({ item, onUpdate }) => {
  const gridData = useMemo(() => {
    try {
      const data = JSON.parse(item.content || '[]');
      return Array.isArray(data) && data.every(row => Array.isArray(row)) ? data : [[]];
    } catch {
      return [[]];
    }
  }, [item.content]);

  const [grid, setGrid] = useState(gridData);
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => { setGrid(gridData); }, [gridData]);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGrid = grid.map((row, rIdx) => 
      rIdx === rowIndex ? row.map((cell, cIdx) => cIdx === colIndex ? value : cell) : row
    );
    setGrid(newGrid);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = window.setTimeout(() => {
      onUpdate(item.id, { content: JSON.stringify(newGrid) });
    }, 800);
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="sticky top-0 bg-surface p-2 border border-border w-12 z-10"></th>
            {grid[0]?.map((_, colIndex) => (
              <th key={colIndex} className="sticky top-0 bg-surface p-2 border border-border font-mono text-text-dim">
                {String.fromCharCode(65 + colIndex)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="sticky left-0 bg-surface p-2 border border-border w-12 font-mono text-text-dim">{rowIndex + 1}</th>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="p-0 border border-border min-w-[120px]">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="w-full h-full p-2 bg-transparent focus:bg-accent/10 outline-none text-text"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const THEMES: { id: PresentationTheme; name: string; previewClass: string }[] = [
    { id: 'default-dark', name: 'Default Dark', previewClass: 'bg-gray-800' },
    { id: 'professional', name: 'Professional', previewClass: 'bg-white border border-gray-200' },
    { id: 'galaxy', name: 'Galaxy', previewClass: "bg-black bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=200&auto=format&fit=crop')]" },
    { id: 'playful', name: 'Playful', previewClass: 'bg-pink-100' },
];

const ThemeSelector: React.FC<{ currentTheme: PresentationTheme, onSelectTheme: (theme: PresentationTheme) => void }> = ({ currentTheme, onSelectTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} title="Change Theme" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm">
                <Icon name="template" className="w-4 h-4 text-text-dim" />
                <span>Theme</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-2xl z-10 p-1">
                    {THEMES.map(({ id, name, previewClass }) => (
                        <button key={id} onClick={() => { onSelectTheme(id); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-text hover:bg-white/5 rounded-md">
                            <div className={`w-5 h-5 rounded ${previewClass}`}></div>
                            <span>{name}</span>
                            {currentTheme === id && <Icon name="check" className="w-4 h-4 ml-auto text-accent"/>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PresentationEditor: React.FC<{ item: PageItem, onUpdate: (id: string, updates: Partial<PageItem>) => void }> = ({ item, onUpdate }) => {
  const [slides, setSlides] = useState(item.slides || []);
  const [activeSlideId, setActiveSlideId] = useState(slides[0]?.id || null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<Slide[] | null>(null);
  const [isAiTopicModalOpen, setIsAiTopicModalOpen] = useState(false);
  const presentContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
      const s = item.slides || [];
      setSlides(s);
      if (!s.find(slide => slide.id === activeSlideId)) {
        setActiveSlideId(s[0]?.id || null);
      }
  }, [item.slides, activeSlideId]);
  
  const activeSlide = useMemo(() => slides.find(s => s.id === activeSlideId), [slides, activeSlideId]);
  const currentIndex = useMemo(() => slides.findIndex(s => s.id === activeSlideId), [slides, activeSlideId]);
  
  const isErrorResult = useMemo(() =>
    generatedSlides?.length === 1 && generatedSlides[0].id === 'error-slide',
    [generatedSlides]
  );
  
  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
      const newSlides = slides.map(s => s.id === slideId ? { ...s, ...updates } : s);
      onUpdate(item.id, { slides: newSlides });
  };

  const addSlide = () => {
    const newSlide: Slide = { id: `slide-${Date.now()}`, title: 'New Slide', content: '' };
    const newSlides = [...slides, newSlide];
    onUpdate(item.id, { slides: newSlides });
    setActiveSlideId(newSlide.id);
  };

  const deleteSlide = (slideId: string) => {
    if (slides.length <= 1) return; // Cannot delete the last slide
    const newSlides = slides.filter(s => s.id !== slideId);
    onUpdate(item.id, { slides: newSlides });
  };

  const handleGenerate = async () => {
    if (!aiTopic) return;
    setIsAiLoading(true);
    const newSlides = await generatePresentation(aiTopic);
    setIsAiLoading(false);
    setGeneratedSlides(newSlides);
    setIsAiTopicModalOpen(false);
    setAiTopic('');
  };

  const handleAppendSlides = () => {
    if (!generatedSlides) return;
    const updatedSlides = [...(item.slides || []), ...generatedSlides];
    onUpdate(item.id, { slides: updatedSlides });
    setGeneratedSlides(null);
  };

  const handleReplaceSlides = () => {
    if (!generatedSlides) return;
    onUpdate(item.id, { slides: generatedSlides });
    setGeneratedSlides(null);
  };

  const startPresenting = () => {
      setIsPresenting(true);
      presentContainerRef.current?.requestFullscreen().catch(console.error);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
        setActiveSlideId(slides[currentIndex + 1].id);
    }
  }, [currentIndex, slides]);

  const handlePrev = useCallback(() => {
      if (currentIndex > 0) {
          setActiveSlideId(slides[currentIndex - 1].id);
      }
  }, [currentIndex, slides]);
  
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  },[]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = window.setTimeout(() => {
        setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const container = presentContainerRef.current;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!document.fullscreenElement) return;
        showControls();
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            handleNext();
        } else if (e.key === 'ArrowLeft') {
            handlePrev();
        }
    };
    
    if (isPresenting && container) {
        showControls();
        container.addEventListener('mousemove', showControls);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
        if (container) {
            container.removeEventListener('mousemove', showControls);
        }
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('keydown', handleKeyDown);
        if (controlsTimer.current) {
            clearTimeout(controlsTimer.current);
        }
    }
  }, [isPresenting, handleNext, handlePrev, showControls]);


  return (
      <div className="flex h-full">
        <div className="w-64 bg-surface border-r border-border p-2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-dim">Slides</h3>
                <button onClick={addSlide} className="p-1 rounded hover:bg-white/10" title="Add Slide"><Icon name="plus" className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {slides.map((slide, index) => (
                    <button key={slide.id} onClick={() => setActiveSlideId(slide.id)} className={`w-full text-left p-2 rounded-md border-2 transition-colors ${activeSlideId === slide.id ? 'bg-accent-subtle border-accent' : 'bg-primary border-transparent hover:border-border'}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-xs text-text-dim">{index + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text truncate">{slide.title}</p>
                                <p className="text-xs text-text-dim truncate">{slide.content.replace(/#+\s*/, '')}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <div className="p-2 border-b border-border flex-shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button 
                      onClick={() => setIsAiTopicModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md hover:bg-white/10 transition-colors text-sm"
                    >
                      <Icon name="sparkles" className="w-4 h-4 text-accent" />
                      Generate with AI
                  </button>
                  <ThemeSelector
                      currentTheme={item.theme || 'default-dark'}
                      onSelectTheme={(theme) => onUpdate(item.id, { theme })}
                  />
                </div>
                 <button onClick={startPresenting} className="flex items-center gap-2 px-3 py-1.5 bg-accent text-primary rounded-md hover:bg-accent-hover transition-colors text-sm font-semibold">
                    <Icon name="play" className="w-4 h-4" /> Present
                </button>
            </div>
            {activeSlide ? (
                <div className="flex-1 p-8 overflow-y-auto">
                    <input 
                        value={activeSlide.title}
                        onChange={e => updateSlide(activeSlide.id, { title: e.target.value })}
                        className="text-4xl font-bold bg-transparent outline-none w-full mb-4 text-text-bright"
                    />
                    <textarea 
                        value={activeSlide.content}
                        onChange={e => updateSlide(activeSlide.id, { content: e.target.value })}
                        className="w-full h-full bg-transparent outline-none resize-none text-text leading-relaxed"
                        placeholder="Slide content (Markdown supported)..."
                    />
                </div>
            ) : <div className="p-8 text-text-dim">No slides. Add one to get started.</div>}
        </div>
        
        {isAiTopicModalOpen && (
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center" onClick={() => !isAiLoading && setIsAiTopicModalOpen(false)}>
            <div className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
              {isAiLoading ? (
                 <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-text font-semibold">Generating your presentation...</p>
                 </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-text-bright mb-2">Generate Presentation</h3>
                  <p className="text-sm text-text-dim mb-4">Enter a topic, and the AI will create a set of slides for you.</p>
                  <input 
                    type="text" 
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && aiTopic && handleGenerate()}
                    className="w-full bg-primary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="e.g., 'The Future of Renewable Energy'"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-5">
                      <button onClick={() => setIsAiTopicModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 text-text hover:bg-white/20 transition-colors">Cancel</button>
                      <button onClick={handleGenerate} disabled={!aiTopic} className="px-4 py-2 text-sm font-semibold rounded-md bg-accent text-primary hover:bg-accent-hover transition-colors disabled:opacity-50">Generate Slides</button>
                  </div>
                </>
              )}
            </div>
         </div>
        )}
        
        {generatedSlides && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setGeneratedSlides(null)}>
              <div className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-lg border border-border" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-text-bright mb-2">
                    {isErrorResult ? 'An Error Occurred' : 'AI Generated Slides'}
                  </h3>
                  <p className="text-sm text-text-dim mb-4">
                     {isErrorResult 
                      ? 'Could not generate slides. Please check the error message below.' 
                      : 'Review the generated slides. You can add them to your presentation or replace the current one.'}
                  </p>
                  <div className="border border-border rounded-md bg-primary p-3 max-h-60 overflow-y-auto mb-5 space-y-2">
                    {generatedSlides.map((slide, index) => (
                      <div key={slide.id} className={`p-2 rounded ${isErrorResult ? 'bg-danger/20' : 'bg-surface'}`}>
                        <p className={`font-semibold truncate ${isErrorResult ? 'text-danger' : 'text-text'}`}>{index + 1}. {slide.title}</p>
                        <p className={`text-xs pl-4 truncate ${isErrorResult ? 'text-danger/80' : 'text-text-dim'}`}>{slide.content.replace(/#+\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setGeneratedSlides(null)} className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 text-text hover:bg-white/20 transition-colors">
                        {isErrorResult ? 'Close' : 'Cancel'}
                      </button>
                      {!isErrorResult && (
                        <>
                          <button onClick={handleAppendSlides} className="px-4 py-2 text-sm font-medium rounded-md bg-white/10 text-text hover:bg-white/20 transition-colors">Append Slides</button>
                          <button onClick={handleReplaceSlides} className="px-4 py-2 text-sm font-semibold rounded-md bg-accent text-primary hover:bg-accent-hover transition-colors">Replace Current</button>
                        </>
                      )}
                  </div>
              </div>
          </div>
        )}

        {isPresenting && (
            <div ref={presentContainerRef} className={`fixed inset-0 z-50 theme-${item.theme || 'default-dark'}`}>
                {activeSlide && (
                    <div className="prose-container">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{`${activeSlide.title}`}</ReactMarkdown>
                        <hr/>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{activeSlide.content}</ReactMarkdown>
                    </div>
                )}
                 <div 
                    onMouseEnter={showControls}
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-300 ease-in-out ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                 >
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-full p-2 text-text shadow-2xl border border-white/10">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentIndex === 0}
                            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous slide"
                        >
                            <Icon name="chevron-left" className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-sm px-3 tabular-nums">
                            {currentIndex + 1} / {slides.length}
                        </span>
                        <button 
                            onClick={handleNext}
                            disabled={currentIndex >= slides.length - 1}
                            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next slide"
                        >
                            <Icon name="chevron-right" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                 <div 
                    onMouseEnter={showControls}
                    className={`fixed top-6 right-6 z-10 transition-opacity duration-300 ease-in-out ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                 >
                    <button 
                        onClick={exitFullscreen}
                        className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                        aria-label="Exit presentation"
                    >
                        <Icon name="close" className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        )}
      </div>
  );
};


const Editor: React.FC<EditorProps> = ({ item, childPages, onUpdate, onCreate, isSidebarVisible, toggleSidebar, onSelectItem }) => {
    const renderContent = () => {
        if (!item) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-text-dim p-8">
                    <Icon name="note" className="w-24 h-24 text-surface mb-4" />
                    <h2 className="text-2xl font-bold text-text-bright">Select an item to view</h2>
                    <p>Or create a new page or database from the sidebar.</p>
                </div>
            );
        }

        switch (item.type) {
            case 'page':
                return <PageEditor item={item} onUpdate={onUpdate} />;
            case 'meeting':
                return <MeetingEditor item={item} onUpdate={onUpdate} />;
            case 'sketch':
                return <SketchEditor item={item} onUpdate={onUpdate} onCreate={onCreate} />;
            case 'database':
                return <DatabaseEditor item={item} childPages={childPages} onUpdate={onUpdate} onCreate={onCreate} onSelectItem={onSelectItem} />;
            case 'spreadsheet':
                return <SpreadsheetEditor item={item} onUpdate={onUpdate} />;
            case 'presentation':
                return <PresentationEditor item={item} onUpdate={onUpdate} />;
            case 'folder':
                return (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-dim p-8">
                        <Icon name="folder" className="w-24 h-24 text-accent/50 mb-4" />
                        <h2 className="text-2xl font-bold text-text-bright">{item.name}</h2>
                        <p>This is a folder. Select an item inside it to view.</p>
                    </div>
                );
            default:
                return <div className="p-8">Unsupported item type.</div>;
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-primary h-full relative min-w-0">
            <header className="flex-shrink-0 p-4 border-b border-border flex items-center gap-3 h-16">
                {!isSidebarVisible && (
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-white/10">
                        <Icon name="menu" className="w-5 h-5" />
                    </button>
                )}
                {item && (
                     <div className="flex items-center gap-3 min-w-0">
                        {item.icon && <span className="text-2xl">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-text-bright truncate" title={item.name}>{item.name}</h1>
                        </div>
                    </div>
                )}
            </header>
            <div className="flex-1 flex flex-col relative min-h-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default Editor;