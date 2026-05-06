import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Save, Type, MousePointer2, Image as ImageIcon, Layout, X, Plus, Check, Loader2, Smartphone, Eye, Code } from 'lucide-react';

export default function Builder({ app }) {
    const { flash } = usePage().props;
    const [components, setComponents] = useState([]);
    const [theme, setTheme] = useState(app.settings || { primary: '#4F46E5' });
    const [selectedId, setSelectedId] = useState(null);
    const [activeTab, setActiveTab] = useState('elements');
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'

    useEffect(() => {
        if (app.pages && app.pages[0]) {
            setComponents(app.pages[0].components || []);
        }
    }, [app]);

    useEffect(() => {
        if (flash.success) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    }, [flash.success]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(components);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setComponents(items);
    };

    const addComponent = (type) => {
        const newId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newComp = {
            id: newId,
            type: type,
            config: type === 'text' ? { content: 'New Text Block', textColor: '#111827', fontSize: 18 } : 
                    type === 'button' ? { label: 'Click Me', buttonColor: theme.primary } : 
                    { url: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=400' }
        };
        setComponents([...components, newComp]);
        setSelectedId(newId);
        setActiveTab('settings');
        
        // Scroll to bottom of device preview
        setTimeout(() => {
            const device = document.getElementById('device-viewport');
            if (device) device.scrollTo({ top: device.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    const updateConfig = (id, field, value) => {
        setComponents(prev => prev.map(c => 
            String(c.id) === String(id) ? { ...c, config: { ...c.config, [field]: value } } : c
        ));
    };

    const removeComponent = (id) => {
        setComponents(components.filter(c => String(c.id) !== String(id)));
        if (selectedId === id) setSelectedId(null);
    };

    const save = () => {
        setIsSaving(true);
        router.put(route('apps.update', app.id), {
            page_id: app.pages[0].id,
            components: components,
            settings: theme
        }, { 
            preserveState: true,
            onFinish: () => setIsSaving(false)
        });
    };

    const selectedComp = components.find(c => String(c.id) === String(selectedId));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Layout size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 leading-tight">{app.name}</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">App Builder / {app.pages[0].name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-1 rounded-xl flex">
                            <button 
                                onClick={() => setViewMode('edit')}
                                className={`px-4 py-2 rounded-lg flex items-center text-xs font-black transition ${viewMode === 'edit' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                <Code size={14} className="mr-2" /> Editor
                            </button>
                            <button 
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-2 rounded-lg flex items-center text-xs font-black transition ${viewMode === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                            >
                                <Eye size={14} className="mr-2" /> Preview
                            </button>
                        </div>

                        <button 
                            onClick={save} 
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black shadow-2xl transition transform active:scale-95 flex items-center disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <Save size={18} className="mr-2" />
                            )}
                            Save Project
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Building ${app.name}`} />

            <div className="flex h-[calc(100vh-80px)] bg-slate-50 overflow-hidden relative">
                {/* --- SIDEBAR --- */}
                <div className={`w-96 bg-white border-r border-slate-200 shadow-2xl z-30 flex flex-col transition-transform duration-300 ${viewMode === 'preview' ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className="flex border-b border-slate-100 text-center font-black text-[10px] uppercase tracking-widest bg-white">
                        <button onClick={() => {setActiveTab('elements'); setSelectedId(null);}} className={`flex-1 py-6 transition ${activeTab === 'elements' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Plus size={16} className="mx-auto mb-1" />
                            Elements
                        </button>
                        <button onClick={() => {setActiveTab('theme'); setSelectedId(null);}} className={`flex-1 py-6 transition ${activeTab === 'theme' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Layout size={16} className="mx-auto mb-1" />
                            Theme
                        </button>
                        {selectedId && (
                            <button onClick={() => setActiveTab('settings')} className={`flex-1 py-6 transition ${activeTab === 'settings' ? 'text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Smartphone size={16} className="mx-auto mb-1" />
                                Properties
                            </button>
                        )}
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto custom-scroll">
                        {activeTab === 'elements' && (
                            <div className="space-y-6">
                                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl mb-8 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <h3 className="font-black text-lg mb-1">Add Components</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drag or click to add</p>
                                    </div>
                                    <Plus className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-125 transition-transform" size={100} />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button onClick={() => addComponent('text')} className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
                                        <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors mr-5">
                                            <Type size={24} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-slate-700">Text Block</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Headers, Body, Lists</span>
                                        </div>
                                    </button>

                                    <button onClick={() => addComponent('button')} className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-rose-500 hover:shadow-xl hover:shadow-rose-50 transition-all group">
                                        <div className="bg-rose-50 p-3 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors mr-5">
                                            <MousePointer2 size={24} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-slate-700">Action Button</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Links, Nav, Actions</span>
                                        </div>
                                    </button>

                                    <button onClick={() => addComponent('image')} className="flex items-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-50 transition-all group">
                                        <div className="bg-emerald-50 p-3 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-5">
                                            <ImageIcon size={24} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black text-slate-700">Photo / Image</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Banners, Logos, Gallery</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'theme' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Brand Color</label>
                                    <div className="flex items-center space-x-6">
                                        <input 
                                            type="color" 
                                            value={theme.primary} 
                                            onChange={(e) => setTheme({...theme, primary: e.target.value})} 
                                            className="w-24 h-24 rounded-[2rem] cursor-pointer shadow-inner border-0 p-0 overflow-hidden" 
                                        />
                                        <div>
                                            <p className="font-black text-slate-700 text-lg uppercase mb-1">{theme.primary}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Applied to buttons & links</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && selectedComp && (
                            <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                    <div className="flex items-center">
                                        <div className="bg-indigo-600 text-white p-2 rounded-xl mr-3 shadow-lg shadow-indigo-100">
                                            {selectedComp.type === 'text' ? <Type size={16}/> : selectedComp.type === 'button' ? <MousePointer2 size={16}/> : <ImageIcon size={16}/>}
                                        </div>
                                        <h3 className="font-black text-slate-800 uppercase text-xs">{selectedComp.type} Settings</h3>
                                    </div>
                                    <button onClick={() => setSelectedId(null)} className="p-2 bg-white text-slate-400 rounded-xl hover:text-slate-800 hover:shadow-md transition shadow-sm"><X size={16}/></button>
                                </div>

                                {selectedComp.type === 'text' && (
                                    <div className="space-y-8">
                                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Text Content</label>
                                            <textarea 
                                                className="w-full border-0 bg-slate-50 rounded-2xl text-sm p-4 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition h-40" 
                                                value={selectedComp.config.content} 
                                                onChange={(e) => updateConfig(selectedId, 'content', e.target.value)} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">Font Color</label>
                                                <div className="flex items-center space-x-3">
                                                    <input type="color" value={selectedComp.config.textColor || '#111827'} onChange={(e) => updateConfig(selectedId, 'textColor', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer" />
                                                    <span className="font-black text-slate-600 uppercase text-[10px]">{selectedComp.config.textColor || '#111827'}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">Font Size</label>
                                                <input 
                                                    type="number" 
                                                    value={selectedComp.config.fontSize || 18} 
                                                    onChange={(e) => updateConfig(selectedId, 'fontSize', parseInt(e.target.value))} 
                                                    className="w-full border-0 bg-slate-50 rounded-xl text-sm font-black text-slate-700"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">Alignment</label>
                                            <div className="flex bg-slate-50 p-1 rounded-xl">
                                                {['left', 'center', 'right'].map((align) => (
                                                    <button 
                                                        key={align}
                                                        onClick={() => updateConfig(selectedId, 'textAlign', align)}
                                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${selectedComp.config.textAlign === align || (!selectedComp.config.textAlign && align === 'left') ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedComp.type === 'button' && (
                                    <div className="space-y-8">
                                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Button Label</label>
                                            <input 
                                                className="w-full border-0 bg-slate-50 rounded-2xl text-sm p-5 font-black text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition" 
                                                value={selectedComp.config.label} 
                                                onChange={(e) => updateConfig(selectedId, 'label', e.target.value)} 
                                            />
                                        </div>
                                        <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem]">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">Button Color</label>
                                            <div className="flex items-center space-x-4">
                                                <input type="color" value={selectedComp.config.buttonColor || theme.primary} onChange={(e) => updateConfig(selectedId, 'buttonColor', e.target.value)} className="w-16 h-16 rounded-2xl cursor-pointer" />
                                                <span className="font-black text-slate-600 uppercase text-sm tracking-widest">{selectedComp.config.buttonColor || theme.primary}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LIVE PREVIEW AREA --- */}
                <div className={`flex-1 overflow-y-auto flex flex-col items-center py-12 px-4 transition-all duration-500 ${viewMode === 'preview' ? 'bg-white' : 'bg-slate-200'}`}>
                    <div className="relative group/device">
                        {/* Device Frame */}
                        <div className={`w-[420px] bg-slate-900 border-[14px] border-slate-900 rounded-[4.5rem] min-h-[840px] h-fit shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative transition-all duration-700 ${viewMode === 'preview' ? 'scale-105' : 'scale-100'}`}>
                            
                            {/* Inner Screen */}
                            <div id="device-viewport" className="flex-1 bg-white pt-14 px-7 pb-12 overflow-y-auto custom-scroll relative">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-7 bg-slate-900 rounded-b-[2rem] z-50"></div>
                                
                                <div className="mb-10 flex justify-between items-end">
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{app.pages[0].name}</h1>
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="iphone_builder_list" isDropDisabled={viewMode === 'preview'}>
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[600px] space-y-8">
                                                {components.length === 0 && (
                                                    <div className="py-20 text-center space-y-4 border-4 border-dashed border-slate-100 rounded-[3rem] animate-pulse">
                                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                                            <Plus size={40} />
                                                        </div>
                                                        <p className="font-black text-slate-300 uppercase text-xs tracking-widest">Start adding elements</p>
                                                    </div>
                                                )}

                                                {components.map((comp, index) => (
                                                    <Draggable key={String(comp.id)} draggableId={String(comp.id)} index={index} isDragDisabled={viewMode === 'preview'}>
                                                        {(dragProvided, snapshot) => (
                                                            <div
                                                                ref={dragProvided.innerRef}
                                                                {...dragProvided.draggableProps}
                                                                onClick={(e) => { 
                                                                    if (viewMode === 'preview') return;
                                                                    e.stopPropagation(); 
                                                                    setSelectedId(comp.id); 
                                                                    setActiveTab('settings'); 
                                                                }}
                                                                className={`p-8 bg-white border-2 rounded-[2.8rem] relative transition-all cursor-pointer group/item ${selectedId === comp.id ? 'border-indigo-600 bg-indigo-50/10 ring-[15px] ring-indigo-500/10 shadow-2xl scale-[1.02]' : 'border-slate-50 hover:border-slate-200 hover:shadow-xl'}`}
                                                            >
                                                                {/* Controls - Only show in edit mode */}
                                                                {viewMode === 'edit' && (
                                                                    <div className="absolute -top-4 -right-2 flex space-x-2 opacity-0 group-hover/item:opacity-100 transition-all transform translate-y-2 group-hover/item:translate-y-0 z-50">
                                                                        <div {...dragProvided.dragHandleProps} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl cursor-grab active:cursor-grabbing hover:scale-110 transition active:scale-95">
                                                                            <GripVertical size={18} />
                                                                        </div>
                                                                        <button onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }} className="bg-rose-500 text-white p-3 rounded-2xl shadow-xl hover:bg-rose-600 hover:scale-110 transition active:scale-95">
                                                                            <Trash2 size={18}/>
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Content Renderers */}
                                                                {comp.type === 'text' && (
                                                                    <p className="font-black leading-tight transition-colors" style={{ 
                                                                        color: comp.config.textColor || '#111827', 
                                                                        fontSize: `${comp.config.fontSize || 18}px`,
                                                                        textAlign: comp.config.textAlign || 'left'
                                                                    }}>
                                                                        {comp.config.content}
                                                                    </p>
                                                                )}

                                                                {comp.type === 'button' && (
                                                                    <button className="w-full py-6 text-white font-black rounded-[1.8rem] shadow-2xl shadow-indigo-100 transition-all active:scale-95 hover:brightness-110" style={{ backgroundColor: comp.config.buttonColor || theme.primary }}>
                                                                        {comp.config.label}
                                                                    </button>
                                                                )}

                                                                {comp.type === 'image' && (
                                                                    <div className="rounded-[1.8rem] overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-slate-100">
                                                                        <img src={comp.config.url} className="w-full h-auto object-cover" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            {/* Home Indicator */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-800 rounded-full z-50"></div>
                        </div>

                        {/* Side Decorations */}
                        <div className="absolute -left-16 top-1/4 space-y-4 opacity-20 pointer-events-none group-hover/device:opacity-40 transition-opacity">
                            <div className="w-1 h-12 bg-slate-900 rounded-full"></div>
                            <div className="w-1 h-20 bg-slate-900 rounded-full"></div>
                            <div className="w-1 h-20 bg-slate-900 rounded-full"></div>
                        </div>
                        <div className="absolute -right-16 top-1/3 opacity-20 pointer-events-none group-hover/device:opacity-40 transition-opacity">
                            <div className="w-1 h-24 bg-slate-900 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* --- TOAST NOTIFICATION --- */}
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center border border-white/10 backdrop-blur-xl">
                        <div className="bg-emerald-500 p-2 rounded-full mr-4">
                            <Check size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">Success</p>
                            <p className="text-xs text-slate-400 font-bold uppercase">Your app changes have been synced!</p>
                        </div>
                    </div>
                </div>

                {/* --- SAVING OVERLAY --- */}
                {isSaving && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center animate-in fade-in duration-300">
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center space-y-6">
                            <div className="relative">
                                <Loader2 size={60} className="text-indigo-600 animate-spin mx-auto" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Save size={20} className="text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800">Saving Project</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Uploading components to cloud</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scroll::-webkit-scrollbar { width: 0px; }
                .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}} />
        </AuthenticatedLayout>
    );
}
