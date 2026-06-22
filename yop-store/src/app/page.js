'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM = { name: '', price: '', description: '' };

const NAV_LINKS = [
  'Road Bikes',
  'Mountain Bikes',
  'Gravel Bikes',
  'Accessories',
  'Services',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductImage({ src, alt }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-800 flex items-center justify-center">
        <svg
          className="h-10 w-10 text-slate-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="w-full max-h-64 object-contain bg-slate-900"
    />
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-2xl p-7 relative">
        <button onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 className="text-base font-bold text-white mb-1">Contact Us</h2>
        <p className="text-xs text-slate-400 mb-6">Interested in <span className="text-amber-400 font-semibold">{product.name}</span>? Reach out via:</p>

        <div className="flex flex-col gap-4">
          {/* Phone */}
          <a href="tel:+251967647777"
            className="flex items-center gap-4 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 transition-colors">
            <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0 7.408 6.003 13.41 13.41 13.41 1.548 0 2.998-.523 4.162-1.399.242-.177.358-.47.3-.754l-1.05-5.073a.75.75 0 00-.577-.576l-2.804-.607a.75.75 0 00-.77.328l-1.024 1.536a11.16 11.16 0 01-5.144-5.144l1.536-1.024a.75.75 0 00.328-.77l-.607-2.804a.75.75 0 00-.576-.577l-5.073-1.05a.75.75 0 00-.754.3A5.985 5.985 0 002.25 6.338z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-bold text-white">+251967647777</p>
            </div>
          </a>

          {/* Telegram */}
          <a href="https://t.me/yopstore" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 transition-colors">
            <div className="h-9 w-9 rounded-full bg-sky-500/15 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400">Telegram</p>
              <p className="text-sm font-bold text-white">t.me/yopstore</p>
            </div>
          </a>

          {/* TikTok */}
          <div className="flex items-center gap-4 rounded-xl bg-slate-700 px-4 py-3">
            <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400">TikTok</p>
              <p className="text-sm font-bold text-white">Yop Store</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({ product, onClose }) {
  // image_urls may be a JSON string "["url1","url2"]", a real array, or a plain URL string
  const urls = (() => {
    const raw = product.image_urls;
    if (raw) {
      if (Array.isArray(raw)) return raw.filter(Boolean);
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
      return [raw];
    }
    // fallback to single image_url
    return [product.image_url].filter(Boolean);
  })();

  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} aria-label="Close"
          className="absolute top-3 right-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* Main image */}
        <div className="relative bg-slate-900 h-64 shrink-0">
          {urls[activeIdx] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urls[activeIdx]} alt={product.name}
              className="h-full w-full object-cover"/>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          )}
          {/* Image counter */}
          {urls.length > 1 && (
            <span className="absolute bottom-2 right-3 text-[10px] font-semibold bg-slate-900/70 text-slate-300 rounded-full px-2 py-0.5">
              {activeIdx + 1} / {urls.length}
            </span>
          )}
        </div>

        {/* Thumbnail strip */}
        {urls.length > 1 && (
          <div className="flex gap-2 px-4 py-3 bg-slate-900 overflow-x-auto shrink-0">
            {urls.map((url, i) => (
              <button key={i} onClick={() => setActiveIdx(i)}
                className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === activeIdx ? 'border-amber-500' : 'border-slate-700 hover:border-slate-500'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`View ${i + 1}`} className="h-full w-full object-cover"/>
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-5 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-bold text-white leading-snug">{product.name}</h2>
            <span className="text-base font-black text-amber-400 shrink-0">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          {product.description && (
            <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const coverUrl = product.image_url ?? product.image_urls;

  return (
    <>
      <div className="bg-slate-800 rounded-2xl overflow-hidden flex flex-col hover:ring-1 hover:ring-amber-500/40 transition shadow-lg">
        <ProductImage src={coverUrl} alt={product.name} />
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 flex-1">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-bold text-amber-400">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          <div className="mt-auto pt-3 flex gap-2">
            <button
              onClick={() => setShowContact(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold py-2 transition-colors">
              📞 Call Now
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/50 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-xs font-semibold py-2 transition-colors">
              ℹ️ Details
            </button>
          </div>
        </div>
      </div>

      {showDetails && <DetailsModal product={product} onClose={() => setShowDetails(false)}/>}
      {showContact && <ContactModal product={product} onClose={() => setShowContact(false)}/>}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-700" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-slate-700 rounded w-1/3" />
        <div className="h-3 bg-slate-700 rounded w-full mt-1" />
        <div className="h-3 bg-slate-700 rounded w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 bg-slate-700 rounded-lg flex-1" />
          <div className="h-8 bg-slate-700 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

function AdminModal({ onClose, onProductAdded }) {
  const [form,      setForm]      = useState({ name: '', price: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Step 1 — upload image to storage if a file was chosen
      let imageUrl = null;
      if (imageFile) {
        const ext      = imageFile.name.split('.').pop();
        const filePath = `bikes/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('bike-image')
          .upload(filePath, imageFile, { upsert: false });

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        imageUrl = supabase.storage.from('bike-image').getPublicUrl(filePath).data.publicUrl;
      }

      // Step 2 — insert product record with the public URL string into both columns
      const { error: dbError } = await supabase.from('items').insert([{
        name:        form.name.trim(),
        price:       parseFloat(form.price),
        description: form.description.trim(),
        image_url:   imageUrl,
      }]);

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setMessage({ type: 'success', text: 'Product added successfully!' });
      setForm({ name: '', price: '', description: '' });
      setImageFile(null);
      setPreview(null);
      onProductAdded();

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'rounded-lg bg-slate-700 border border-slate-600 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition" aria-label="Close modal">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add New Product</h2>

        {message && (
          <div className={`mb-5 rounded-lg px-4 py-3 text-sm font-medium border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {message.type === 'success' ? '✓ ' : '✕ '}{message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-name" className="text-sm font-medium text-slate-300">
              Product Name <span className="text-amber-400">*</span>
            </label>
            <input id="m-name" name="name" type="text" required placeholder="e.g. Trek Domane SL 6"
              value={form.name} onChange={handleChange} className={inputCls}/>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-price" className="text-sm font-medium text-slate-300">
              Price (USD) <span className="text-amber-400">*</span>
            </label>
            <input id="m-price" name="price" type="number" required min="0" step="0.01" placeholder="0.00"
              value={form.price} onChange={handleChange} className={inputCls}/>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-description" className="text-sm font-medium text-slate-300">Description</label>
            <textarea id="m-description" name="description" rows={3} placeholder="Short product description..."
              value={form.description} onChange={handleChange}
              className={`${inputCls} w-full resize-none`}/>
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Product Image</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-600 hover:border-amber-500/60 bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors px-4 py-4 text-center">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-24 w-full object-contain rounded-md"/>
              ) : (
                <>
                  <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <span className="text-xs text-slate-400">Click to upload — PNG, JPG, WEBP</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFilePick} className="sr-only"/>
            </label>
            {preview && (
              <button type="button" onClick={() => { setImageFile(null); setPreview(null); }}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-colors self-end">
                ✕ Remove image
              </button>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed px-6 py-3 text-sm font-bold text-slate-950 transition-colors">
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {imageFile ? 'Uploading…' : 'Saving…'}
              </>
            ) : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function YopStore() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchProducts() {
    setProductsLoading(true);
    setProductsError(null);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: false });
    if (error) setProductsError(error.message);
    else setProducts(data);
    setProductsLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Split products: first half in main grid, rest in sidebar
  const mainProducts = products.slice(0, Math.ceil(products.length / 2));
  const sideProducts = products.slice(Math.ceil(products.length / 2));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center gap-6">
          {/* Logo circle + Brand */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yop.jpg"
            alt="Yop Store logo"
            className="self-stretch w-14 object-cover rounded-full border-2 border-amber-500 shrink-0 -my-3"
          />
          <span className="text-xl font-black tracking-tighter text-white shrink-0">
            YOP <span className="text-amber-500">STORE</span>
          </span>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-5 ml-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-slate-300 hover:text-amber-400 transition-colors whitespace-nowrap"
              >
                {link}
              </a>
            ))}
            <a
              href="/login"
              className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
            >
              Admin
            </a>
          </nav>

          {/* Mobile admin trigger */}
          <a
            href="/login"
            className="lg:hidden ml-auto text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors"
          >
            Admin
          </a>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* ── Left / Main Section (2/3) ─────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-800 p-10 flex flex-col gap-4 min-h-[220px] justify-center">
            {/* Decorative ring */}
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-amber-500/10" />
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-amber-500/10" />

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400 uppercase tracking-widest">
              🔥 New Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Building a Brand,<br />
              Driving a Dream...<br />
              <span className="text-amber-500">Beyond This Horizon.</span><br />
              <span className="text-slate-300 text-2xl sm:text-3xl">Your Local Yop Shop</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-sm">
              Premium bikes and gear for every terrain. Built for performance, designed to last.
            </p>
            <button className="w-fit mt-2 flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors">
              Shop New Arrivals
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Product Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                All Products
                {!productsLoading && (
                  <span className="ml-2 text-sm font-normal text-slate-400">({products.length})</span>
                )}
              </h2>
            </div>

            {/* Loading */}
            {productsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error */}
            {!productsLoading && productsError && (
              <div className="rounded-lg px-4 py-3 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                ✕ Failed to load products: {productsError}
              </div>
            )}

            {/* Empty */}
            {!productsLoading && !productsError && products.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-800/50 border border-dashed border-slate-700 py-20 text-center">
                <span className="text-4xl mb-3">🚲</span>
                <p className="text-slate-400 text-sm font-medium">No products yet.</p>
              </div>
            )}

            {/* Grid */}
            {!productsLoading && !productsError && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products
                  .filter((p) =>
                    searchQuery.trim() === '' ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar (1/3) ───────────────────────────────────── */}
        <aside className="lg:w-80 xl:w-96 shrink-0 flex flex-col gap-6">

          {/* Promo banner */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-950">Limited Offer</p>
            <p className="text-xl font-black text-white leading-tight">Up to 30% off<br />Road Bikes</p>
            <button className="mt-2 w-fit rounded-full bg-white/20 hover:bg-white/30 px-4 py-1.5 text-xs font-bold text-white transition-colors">
              Shop Now →
            </button>
          </div>

          {/* Watermark logo */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden p-6 flex flex-col items-start justify-between min-h-[120px]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <span className="text-sm font-semibold text-white tracking-wide">
                  Phone: <span className="text-amber-400">+251967647777</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-sm font-semibold text-white">
                  Telegram:{' '}
                  <a href="https://t.me/yopstore" target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 transition-colors">
                    t.me/yopstore
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
                <span className="text-sm font-semibold text-white">
                  TikTok: <span className="text-amber-400">Yop Store</span>
                </span>
              </div>
            </div>
            <span
              className="absolute -bottom-4 -right-2 text-8xl font-black text-slate-800 select-none leading-none"
              aria-hidden="true"
            >
              YOP
            </span>
            <span className="relative text-xs text-slate-500 mt-3">© 2025 Yop Store</span>
          </div>

          {/* Live Chat — sticky on scroll */}
          <div className="sticky top-24 rounded-2xl bg-slate-800 border border-slate-700 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-400 text-base">💬</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Live Chat</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  Support online now
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Have a question? Our team is ready to help you find the perfect ride.
            </p>
            <button className="rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors">
              Start Conversation
            </button>
          </div>
        </aside>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-900 mt-8">
        <div className="max-w-screen-xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Social Media */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">
              Social Media
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="https://t.me/yopstore" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors">
                  <svg className="h-4 w-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram — t.me/yopstore
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@yopstore" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                  <svg className="h-4 w-4 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                  </svg>
                  TikTok — Yop Store
                </a>
              </li>
            </ul>
          </div>

          {/* Shop Information */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">
              Shop Information
            </h4>
            <ul className="flex flex-col gap-2">
              {['About Us', 'Shipping & Returns', 'Size Guide', 'Warranty Policy', 'FAQs'].map((s) => (
                <li key={s}>
                  <a href="#" className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">
              Contact
            </h4>
            <ul className="flex flex-col gap-2">
              <li className="text-sm text-slate-400">📧 hello@yopstore.com</li>
              <li className="text-sm text-slate-400">
                📞{' '}
                <a href="tel:+251967647777" className="hover:text-amber-400 transition-colors">
                  +251967647777
                </a>
              </li>
              <li className="text-sm text-slate-400">
                📍 Semit Fiyel Bet, Behind Yonas Chercher
              </li>
              <li>
                <a href="https://t.me/yopstore" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                  Message us on Telegram →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 px-6 py-4 max-w-screen-xl mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-600">© 2025 Yop Store. All rights reserved.</span>
          <span className="text-xs font-black tracking-tighter text-slate-700">
            YOP <span className="text-amber-700">STORE</span>
          </span>
        </div>
      </footer>

      {/* ── Admin Modal ─────────────────────────────────────────────────── */}
      {adminOpen && (
        <AdminModal
          onClose={() => setAdminOpen(false)}
          onProductAdded={() => {
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
