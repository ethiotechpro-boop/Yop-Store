'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM = { name: '', price: '', description: '', stock: '1', status: 'LIVE' };
const BUCKET = 'bike-image';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    LIVE:     'bg-green-500/15 text-green-400 border-green-500/30',
    PENDING:  'bg-amber-500/15 text-amber-400 border-amber-500/30',
    DRAFT:    'bg-slate-500/15 text-slate-400 border-slate-500/30',
    ARCHIVED: 'bg-red-500/15  text-red-400   border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? styles.DRAFT}`}>
      {status}
    </span>
  );
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function ThumbImage({ src, alt }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setErr(true)} className="h-10 w-10 rounded-lg object-cover shrink-0"/>;
}

// ─── File Upload helper ───────────────────────────────────────────────────────

async function uploadImage(file) {
  const ext      = file.name.split('.').pop();
  const filePath = `bikes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// ─── Multi-Image Upload Field (up to 6) ──────────────────────────────────────

const MAX_IMAGES = 6;

function MultiImageUploadField({ files, setFiles, existingUrls }) {
  // slots: array of { file: File|null, preview: string|null, existing: string|null }
  const [slots, setSlots] = useState(() => {
    const base = (existingUrls ?? []).slice(0, MAX_IMAGES).map(url => ({
      file: null, preview: url, existing: url,
    }));
    return base;
  });

  function handlePick(e, idx) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const preview = URL.createObjectURL(picked);

    setSlots(prev => {
      const next = [...prev];
      if (idx < next.length) {
        // replacing an existing slot
        next[idx] = { file: picked, preview, existing: null };
      } else {
        // adding a new slot at the end
        next.push({ file: picked, preview, existing: null });
      }
      return next;
    });

    setFiles(prev => {
      const next = [...prev];
      next[idx] = picked;   // always write at the correct index
      return next;
    });
  }

  function removeSlot(idx) {
    setSlots(prev => prev.filter((_, i) => i !== idx));
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  const canAddMore = slots.length < MAX_IMAGES;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Product Images
        </label>
        <span className="text-[10px] text-slate-500">{slots.length} / {MAX_IMAGES}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Existing + new slots */}
        {slots.map((slot, idx) => (
          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-600 bg-slate-700 aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.preview} alt={`Image ${idx + 1}`} className="h-full w-full object-cover"/>
            {/* Replace button */}
            <label className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-[10px] text-white font-semibold bg-slate-700/80 rounded px-2 py-1">Replace</span>
              <input type="file" accept="image/*" onChange={e => handlePick(e, idx)} className="sr-only"/>
            </label>
            {/* Remove button */}
            <button type="button" onClick={() => removeSlot(idx)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-white text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
              ✕
            </button>
            <span className="absolute bottom-1 left-1 text-[9px] text-white/60 font-semibold">
              {idx === 0 ? 'Cover' : `#${idx + 1}`}
            </span>
          </div>
        ))}

        {/* Add slot */}
        {canAddMore && (
          <label className="relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-600 hover:border-amber-500/60 bg-slate-700/40 hover:bg-slate-700 cursor-pointer transition-colors aspect-square text-center">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            <span className="text-[10px] text-slate-500">Add photo</span>
            <input type="file" accept="image/*"
              onChange={e => handlePick(e, slots.length)} className="sr-only"/>
          </label>
        )}
      </div>

      <p className="text-[10px] text-slate-600">First image is the cover. Max {MAX_IMAGES} photos. PNG, JPG, WEBP.</p>
    </div>
  );
}


// ─── Product Modal (Add / Edit) ───────────────────────────────────────────────

function ProductModal({ onClose, onSaved, editItem = null }) {
  const [form,       setForm]       = useState(editItem ? {
    name:        editItem.name        ?? '',
    price:       editItem.price       ?? '',
    description: editItem.description ?? '',
    stock:       editItem.stock       ?? '1',
    status:      editItem.status      ?? 'LIVE',
  } : INITIAL_FORM);

  // imageFiles[i] is a File to upload, or null if keeping existing URL at that slot
  const [imageFiles, setImageFiles] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState(null);

  // Derive existing URLs from editItem
  const existingUrls = editItem
    ? (() => {
        const raw = editItem.image_urls ?? editItem.image_url;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : [raw]; }
        catch { return [raw]; }
      })()
    : [];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);

    try {
      // Build final URL list: upload new files, keep existing URLs for null slots
      const finalUrls = [];
      const slotCount = Math.max(imageFiles.length, existingUrls.length);

      for (let i = 0; i < slotCount; i++) {
        const file = imageFiles[i];
        if (file instanceof File) {
          // New file chosen for this slot — upload it
          const url = await uploadImage(file);
          finalUrls.push(url);
        } else if (existingUrls[i]) {
          // No new file, keep existing URL
          finalUrls.push(existingUrls[i]);
        }
        // if both are undefined/null (slot was removed), skip it
      }

      const payload = {
        name:        form.name.trim(),
        price:       parseFloat(form.price),
        description: form.description.trim(),
        stock:       parseInt(form.stock, 10) || 0,
        status:      form.status,
        image_url:   finalUrls[0] ?? null,
        image_urls:  finalUrls.length > 0 ? JSON.stringify(finalUrls) : null,
      };

      let error;
      if (editItem) {
        ({ error } = await supabase.from('items').update(payload).eq('id', editItem.id));
      } else {
        ({ error } = await supabase.from('items').insert([payload]));
      }

      if (error) throw new Error(error.message);

      setMsg({ type: 'success', text: editItem ? 'Product updated!' : 'Product added!' });
      if (!editItem) { setForm(INITIAL_FORM); setImageFiles([]); }
      onSaved();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const uploadsInProgress = imageFiles.filter(f => f instanceof File).length;

  const field = 'rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition w-full';
  const lbl   = 'text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 className="text-lg font-bold text-white mb-6">
          {editItem ? '✏️ Edit Product' : '➕ Add New Bike'}
        </h2>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium border ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={lbl}>Bike Model <span className="text-amber-400">*</span></label>
            <input name="name" type="text" required placeholder="e.g. Trek Domane SL 6"
              value={form.name} onChange={handleChange} className={field}/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Price (USD) <span className="text-amber-400">*</span></label>
              <input name="price" type="number" required min="0" step="0.01" placeholder="0.00"
                value={form.price} onChange={handleChange} className={field}/>
            </div>
            <div>
              <label className={lbl}>Stock Qty</label>
              <input name="stock" type="number" min="0" placeholder="1"
                value={form.stock} onChange={handleChange} className={field}/>
            </div>
          </div>

          <div>
            <label className={lbl}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={field}>
              <option value="LIVE">LIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <div>
            <label className={lbl}>Description</label>
            <textarea name="description" rows={3} placeholder="Short product description..."
              value={form.description} onChange={handleChange} className={`${field} resize-none`}/>
          </div>

          {/* Multi-image upload — up to 6 photos */}
          <MultiImageUploadField
            files={imageFiles}
            setFiles={setImageFiles}
            existingUrls={existingUrls}
          />

          <button type="submit" disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-slate-950 transition-colors">
            {loading
              ? <><Spinner/> {uploadsInProgress > 0 ? `Uploading ${uploadsInProgress} image${uploadsInProgress > 1 ? 's' : ''}…` : 'Saving…'}</>
              : (editItem ? 'Save Changes' : 'Add Bike')}
          </button>
        </form>
      </div>
    </div>
  );
}


// ─── Admin Settings View ──────────────────────────────────────────────────────

function SettingsView() {
  const [curr,    setCurr]    = useState('');
  const [next,    setNext]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setMsg(null);

    if (next !== confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (next.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setLoading(true);

    // 1. Verify current password against admin_users table
    const email = typeof window !== 'undefined'
      ? (localStorage.getItem('adminEmail') ?? '')
      : '';

    const { data: rows, error: fetchErr } = await supabase
      .from('admin_users')
      .select('id')
      .eq('password', curr)
      .limit(1);

    if (fetchErr || !rows?.length) {
      setLoading(false);
      setMsg({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }

    // 2. Update to new password
    const { error: updateErr } = await supabase
      .from('admin_users')
      .update({ password: next })
      .eq('id', rows[0].id);

    setLoading(false);

    if (updateErr) {
      setMsg({ type: 'error', text: updateErr.message });
      return;
    }

    setMsg({ type: 'success', text: 'Password updated successfully!' });
    setCurr(''); setNext(''); setConfirm('');
  }

  const field = 'rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition w-full';
  const lbl   = 'text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      <div>
        <h2 className="text-xl font-black text-white">Account Security & Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your admin credentials and account preferences.</p>
      </div>

      {/* Password card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
          <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">Change Password</p>
            <p className="text-xs text-slate-500">Update your admin login credentials.</p>
          </div>
        </div>

        {msg && (
          <div className={`mb-5 rounded-lg px-4 py-3 text-sm font-medium border ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
          <div>
            <label className={lbl}>Current Password</label>
            <input type="password" required placeholder="Enter current password"
              value={curr} onChange={e => setCurr(e.target.value)} className={field}/>
          </div>
          <div>
            <label className={lbl}>New Password</label>
            <input type="password" required placeholder="Enter new password (min 6 chars)"
              value={next} onChange={e => setNext(e.target.value)} className={field}/>
          </div>
          <div>
            <label className={lbl}>Confirm New Password</label>
            <input type="password" required placeholder="Re-enter new password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className={`${field} ${confirm && next !== confirm ? 'border-red-500/60 focus:ring-red-500' : ''}`}/>
            {confirm && next !== confirm && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-slate-950 transition-colors">
            {loading ? <><Spinner/> Updating…</> : '🔒 Update Password'}
          </button>
        </form>
      </div>

      {/* Info card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex items-start gap-4">
        <span className="text-2xl shrink-0">ℹ️</span>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Security Notice</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Passwords are stored in your Supabase <code className="text-amber-400 bg-slate-700 px-1 rounded">admin_users</code> table.
            For production use, consider migrating to Supabase Auth for hashed, token-based sessions.
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeSection, setActiveSection, inventoryOpen, setInventoryOpen, onLogout, onAddBike }) {
  const navItem = (label, icon, key) => (
    <button key={key} onClick={() => setActiveSection(key)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeSection === key ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
      <span className="text-base">{icon}</span>{label}
    </button>
  );

  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800">
        <a href="/" className="text-lg font-black tracking-tighter text-white">
          YOP <span className="text-amber-500">STORE</span>
        </a>
        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {/* Dashboard → shows stats + table */}
        {navItem('Dashboard', '🏠', 'dashboard')}

        {/* Inventory dropdown */}
        <div>
          <button onClick={() => setInventoryOpen(o => !o)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${['add-bike','manage-stock','pending'].includes(activeSection) ? 'text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
            <span className="flex items-center gap-3"><span className="text-base">📦</span>Inventory</span>
            <svg className={`h-3.5 w-3.5 transition-transform ${inventoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          {inventoryOpen && (
            <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-slate-700 pl-3">
              {/* Add Bike → opens the modal directly */}
              <button
                onClick={() => { setActiveSection('add-bike'); onAddBike(); }}
                className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors ${activeSection === 'add-bike' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-200'}`}>
                Add Bike
              </button>
              {/* Manage Stock → switches to stock management view */}
              <button
                onClick={() => setActiveSection('manage-stock')}
                className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors ${activeSection === 'manage-stock' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-200'}`}>
                Manage Stock
              </button>
              {/* Pending Approvals → shows inventory filtered to pending */}
              <button
                onClick={() => setActiveSection('pending')}
                className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors ${activeSection === 'pending' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-200'}`}>
                Pending Approvals
              </button>
            </div>
          )}
        </div>

        {navItem('Analytics',      '📊', 'analytics')}
        {/* Admin Settings → switches main panel */}
        {navItem('Admin Settings', '⚙️',  'settings')}
      </nav>

      {/* User badge + logout */}
      <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">A</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">Admin</p>
          <p className="text-[10px] text-slate-500 truncate">yopstore.com</p>
        </div>
        <button onClick={onLogout} aria-label="Log out" title="Log out"
          className="shrink-0 text-slate-500 hover:text-red-400 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}


// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className={`text-3xl font-black ${accent ?? 'text-white'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Inventory Table ──────────────────────────────────────────────────────────

function InventoryTable({ items, loading, error, onEdit, onDelete, onStatusChange, selected, setSelected }) {
  function toggleAll(e) {
    setSelected(e.target.checked ? items.map(i => i.id) : []);
  }
  function toggleOne(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  if (loading) return (
    <div className="flex flex-col gap-3 p-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-700 animate-pulse"/>)}
    </div>
  );

  if (error) return (
    <div className="m-6 rounded-lg px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/30">
      ✕ {error}
    </div>
  );

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl mb-3">🚲</span>
      <p className="text-slate-400 text-sm">No items in inventory yet.</p>
    </div>
  );

  const actionBtn = (label, onClick, color) => (
    <button onClick={onClick} className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${color}`}>
      {label}
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="w-10 px-4 py-3 text-left">
              <input type="checkbox" onChange={toggleAll}
                checked={selected.length === items.length && items.length > 0}
                className="rounded border-slate-600 bg-slate-700 accent-amber-500"/>
            </th>
            {['Image','Bike Model','Price','Stock','Status','Created','Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3">
                <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)}
                  className="rounded border-slate-600 bg-slate-700 accent-amber-500"/>
              </td>
              <td className="px-4 py-3"><ThumbImage src={item.image_url ?? item.image_urls} alt={item.name}/></td>
              <td className="px-4 py-3">
                <p className="font-semibold text-white line-clamp-1 max-w-[180px]">{item.name}</p>
                {item.description && <p className="text-xs text-slate-500 line-clamp-1 max-w-[180px]">{item.description}</p>}
              </td>
              <td className="px-4 py-3 font-bold text-amber-400 whitespace-nowrap">${parseFloat(item.price ?? 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className={`font-semibold ${(item.stock ?? 0) <= 0 ? 'text-red-400' : (item.stock ?? 0) <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {item.stock ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3"><StatusBadge status={item.status ?? 'DRAFT'}/></td>
              <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {actionBtn('Edit', () => onEdit(item), 'bg-slate-600 hover:bg-slate-500 text-white')}
                  {(item.status ?? 'DRAFT') !== 'LIVE' && actionBtn('Activate', () => onStatusChange(item.id, 'LIVE'), 'bg-green-500/15 hover:bg-green-500/30 text-green-400')}
                  {(item.status ?? 'DRAFT') !== 'ARCHIVED' && actionBtn('Archive', () => onStatusChange(item.id, 'ARCHIVED'), 'bg-slate-500/20 hover:bg-slate-500/40 text-slate-400')}
                  {actionBtn('Delete', () => onDelete(item.id), 'bg-red-500/15 hover:bg-red-500/30 text-red-400')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ─── Operations Centre ────────────────────────────────────────────────────────

function OperationsGrid({ onAddBike, pendingCount, archivedCount }) {
  const blocks = [
    { key: 'add',     icon: '➕', title: 'ADD NEW BIKE',       desc: 'Insert a new product listing into the live inventory.',    accent: 'border-amber-500/40 hover:border-amber-500',   action: onAddBike, btnLabel: 'Open Form →',      btnStyle: 'bg-amber-500 hover:bg-amber-400 text-slate-950' },
    { key: 'pending', icon: '⏳', title: 'MANAGE PENDING',     desc: `${pendingCount} item(s) awaiting review and activation.`,  accent: 'border-amber-500/20 hover:border-amber-500/50', action: null,      btnLabel: 'Review Items →',   btnStyle: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { key: 'bulk',    icon: '🔄', title: 'BULK STATUS UPDATE', desc: 'Select multiple items and update their status at once.',   accent: 'border-blue-500/20 hover:border-blue-500/50',   action: null,      btnLabel: 'Bulk Update →',    btnStyle: 'bg-slate-700 hover:bg-slate-600 text-white' },
    { key: 'archive', icon: '🗄️', title: 'ARCHIVE OLD STOCK',  desc: `${archivedCount} item(s) currently in archive.`,          accent: 'border-slate-600 hover:border-slate-500',       action: null,      btnLabel: 'View Archive →',   btnStyle: 'bg-slate-700 hover:bg-slate-600 text-white' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {blocks.map(b => (
        <div key={b.key} className={`bg-slate-800 rounded-xl border ${b.accent} p-5 flex flex-col gap-3 transition-colors`}>
          <span className="text-2xl">{b.icon}</span>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">{b.title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
          </div>
          <button onClick={b.action ?? undefined} className={`mt-auto w-full rounded-lg px-4 py-2 text-xs font-bold transition-colors ${b.btnStyle}`}>
            {b.btnLabel}
          </button>
        </div>
      ))}
    </div>
  );
}


// ─── Manage Stock View ────────────────────────────────────────────────────────

function ManageStockView({ items, loading, onStockSave }) {
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [saved,  setSaved]  = useState({});

  function handleChange(id, value) {
    setEdits(e => ({ ...e, [id]: value }));
    setSaved(s => ({ ...s, [id]: false }));
  }

  async function handleSave(id) {
    const newStock = parseInt(edits[id], 10);
    if (isNaN(newStock) || newStock < 0) return;
    setSaving(s => ({ ...s, [id]: true }));
    await supabase.from('items').update({ stock: newStock }).eq('id', id);
    setSaving(s => ({ ...s, [id]: false }));
    setSaved(s =>  ({ ...s, [id]: true }));
    onStockSave();
  }

  if (loading) return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-slate-700 animate-pulse"/>)}
    </div>
  );

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl mb-3">📦</span>
      <p className="text-slate-400 text-sm">No items to manage yet.</p>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h2 className="text-sm font-bold text-white">Manage Stock Levels</h2>
        <p className="text-xs text-slate-500 mt-0.5">Edit and save stock quantities per item.</p>
      </div>
      <div className="divide-y divide-slate-700/60">
        {items.map(item => {
          const val = edits[item.id] !== undefined ? edits[item.id] : String(item.stock ?? 0);
          const stockNum = parseInt(val, 10);
          const isLow = !isNaN(stockNum) && stockNum <= 1;
          return (
            <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-700/30 transition-colors">
              <ThumbImage src={item.image_url ?? item.image_urls} alt={item.name}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                <p className="text-xs text-slate-500">${parseFloat(item.price ?? 0).toFixed(2)} · <StatusBadge status={item.status ?? 'DRAFT'}/></p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isLow && <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Low</span>}
                <input
                  type="number" min="0"
                  value={val}
                  onChange={e => handleChange(item.id, e.target.value)}
                  className="w-20 rounded-lg bg-slate-700 border border-slate-600 px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
                <button
                  onClick={() => handleSave(item.id)}
                  disabled={saving[item.id]}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-slate-950 text-xs font-bold px-3 py-1.5 transition-colors min-w-[64px] justify-center"
                >
                  {saving[item.id] ? <Spinner/> : saved[item.id] ? '✓ Saved' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();

  const [authReady,     setAuthReady]     = useState(false);
  const [items,         setItems]         = useState([]);
  const [loadingItems,  setLoadingItems]  = useState(true);
  const [itemsError,    setItemsError]    = useState(null);
  const [modal,         setModal]         = useState(null); // null | 'add' | item-object
  const [selected,      setSelected]      = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('isAdminAuthenticated') !== 'true') {
      router.replace('/login');
    } else {
      setAuthReady(true);
    }
  }, [router]);

  async function fetchItems() {
    setLoadingItems(true); setItemsError(null);
    const { data, error } = await supabase.from('items').select('*').order('id', { ascending: false });
    if (error) setItemsError(error.message);
    else setItems(data);
    setLoadingItems(false);
  }

  useEffect(() => { fetchItems(); }, []);

  function handleLogout() {
    localStorage.removeItem('isAdminAuthenticated');
    router.push('/');
  }

  async function handleDelete(id) {
    if (deleteConfirm !== id) { setDeleteConfirm(id); return; }
    await supabase.from('items').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchItems();
  }

  async function handleStatusChange(id, status) {
    await supabase.from('items').update({ status }).eq('id', id);
    fetchItems();
  }

  const liveCount     = items.filter(i => (i.status ?? 'DRAFT') === 'LIVE').length;
  const lowStock      = items.filter(i => (i.stock  ?? 0) <= 1).length;
  const archivedCount = items.filter(i => (i.status ?? '') === 'ARCHIVED').length;
  const pendingCount  = items.filter(i => (i.status ?? '') === 'PENDING').length;

  // Sections that show the dashboard / inventory table
  const isDashboardView  = ['dashboard', 'add-bike', 'pending', 'analytics'].includes(activeSection);
  const isManageStock    = activeSection === 'manage-stock';
  const isSettingsView   = activeSection === 'settings';

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-amber-500"/>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar
        activeSection={activeSection} setActiveSection={setActiveSection}
        inventoryOpen={inventoryOpen} setInventoryOpen={setInventoryOpen}
        onLogout={handleLogout}
        onAddBike={() => setModal('add')}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">

        {/* Top bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-lg font-black text-white">
              {isSettingsView ? 'Admin Settings' : 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSettingsView ? 'Manage your account security and preferences.' : "Welcome back, Admin — here's your store overview."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors">
              View Storefront ↗
            </a>
            {!isSettingsView && (
              <button onClick={() => setModal('add')}
                className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors">
                ➕ Add Bike
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-red-500/50 bg-slate-800 hover:bg-red-500/10 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Log Out
            </button>
          </div>
        </header>

        {/* ── Manage Stock panel ──────────────────────────────────────────── */}
        {isManageStock && (
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <ManageStockView
              items={items}
              loading={loadingItems}
              onStockSave={fetchItems}
            />
          </div>
        )}

        {/* ── Settings panel ──────────────────────────────────────────────── */}
        {isSettingsView && (
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <SettingsView/>
          </div>
        )}

        {/* ── Dashboard / Inventory panel ─────────────────────────────────── */}
        {isDashboardView && (
          <div className="flex-1 px-6 py-6 flex flex-col gap-6 overflow-y-auto">

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard icon="🟢" label="Total Live Listings" value={liveCount}     sub={`of ${items.length} total items`} accent="text-green-400"/>
              <MetricCard icon="⚠️" label="Low Stock Alerts"    value={lowStock}      sub="items at ≤1 unit"                 accent="text-amber-400"/>
              <MetricCard icon="🗄️" label="Archived Bikes"      value={archivedCount} sub="removed from storefront"          accent="text-slate-400"/>
            </div>

            {/* Inventory table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-sm font-bold text-white">Manage Bike Inventory</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{items.length} total records</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.length > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">{selected.length} selected</span>
                  )}
                  <button onClick={fetchItems} disabled={loadingItems}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-50 transition-colors">
                    {loadingItems ? <Spinner/> : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              {deleteConfirm && (
                <div className="mx-6 mt-4 rounded-lg px-4 py-3 bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 text-sm">
                  <span className="text-red-400">⚠️ Confirm permanent deletion of this item?</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(deleteConfirm)}
                      className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors">
                      Yes, Delete
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 rounded-md bg-slate-600 hover:bg-slate-500 text-white text-xs font-semibold transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <InventoryTable
                items={items} loading={loadingItems} error={itemsError}
                onEdit={item => setModal(item)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                selected={selected} setSelected={setSelected}
              />
            </div>

            {/* Operations Centre */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Inventory Operations Centre
              </h2>
              <OperationsGrid
                onAddBike={() => setModal('add')}
                pendingCount={pendingCount}
                archivedCount={archivedCount}
              />
            </div>

          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ProductModal
          editItem={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchItems}
        />
      )}
    </div>
  );
}
