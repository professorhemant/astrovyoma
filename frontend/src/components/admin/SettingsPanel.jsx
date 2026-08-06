import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader, Save } from 'lucide-react';
import { admin as adminApi } from '../../api';

// Renders the Settings screen from the server schema, so adding a setting is a
// line in contentSchema.js rather than a new input wired up by hand here.
//
// These now persist to the site_settings table. They previously lived in a
// module variable on the server and reset to defaults on every restart, which is
// why saved values kept disappearing.

function Control({ field, value, onChange }) {
  const base = 'w-full bg-cosmic-900 border border-gold-600/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-gold-500 transition-colors';

  if (field.type === 'boolean') {
    return (
      <button type="button" onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-gold-500' : 'bg-cosmic-700'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    );
  }
  if (field.type === 'number') {
    return <input type="number" className={base} value={value ?? ''} min={field.min} max={field.max}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
  }
  if (field.type === 'textarea') {
    return <textarea rows={3} className={`${base} resize-y`} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
  }
  return <input type="text" className={base} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
}

export default function SettingsPanel() {
  const [groups, setGroups] = useState(null);
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([adminApi.contentSchema(), adminApi.getSettings()])
      .then(([s, v]) => {
        setGroups(s.data.settingsGroups || []);
        setValues(v.data || {});
        setSaved(v.data || {});
      })
      .catch(() => toast.error('Failed to load settings'));
  }, []);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  async function save() {
    setSaving(true);
    try {
      const { data } = await adminApi.updateSettings(values);
      setValues(data);
      setSaved(data);
      toast.success('Saved — live on the site now');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!groups) {
    return <div className="flex justify-center py-16"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;
  }

  return (
    <div className="pb-24">
      <h2 className="font-serif text-2xl text-gold-400 mb-1">Site Settings</h2>
      <p className="text-gray-500 text-sm mb-6">
        These are stored in the database and survive restarts and deploys.
      </p>

      <div className="space-y-5 max-w-2xl">
        {groups.map(group => (
          <div key={group.key} className="card-cosmic p-5 rounded-2xl">
            <h3 className="text-gold-400 text-sm font-semibold uppercase tracking-wide mb-1">{group.label}</h3>
            {group.help && <p className="text-gray-500 text-xs mb-4">{group.help}</p>}

            <div className="space-y-4">
              {group.fields.map(field => (
                <div key={field.key} className={field.type === 'boolean' ? 'flex items-start justify-between gap-4' : ''}>
                  <div className={field.type === 'boolean' ? '' : 'mb-1'}>
                    <label className="block text-sm text-gray-200">{field.label}</label>
                    {field.help && <p className="text-[11px] text-gray-500 mt-0.5">{field.help}</p>}
                  </div>
                  {field.type === 'boolean'
                    ? <Control field={field} value={values[field.key]} onChange={v => setValues(s => ({ ...s, [field.key]: v }))} />
                    : <div className="mt-1"><Control field={field} value={values[field.key]} onChange={v => setValues(s => ({ ...s, [field.key]: v }))} /></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky so the save button is reachable without scrolling back up. */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-cosmic-950 via-cosmic-950 to-transparent max-w-2xl">
        <button onClick={save} disabled={saving || !dirty}
          className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40">
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {dirty ? 'Save All Settings' : 'No changes to save'}
        </button>
      </div>
    </div>
  );
}
