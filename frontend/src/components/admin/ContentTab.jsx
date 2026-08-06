import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { admin as adminApi } from '../../api';
import ContentEditor from './ContentEditor';

// Hosts every editable list behind a picker. The list of lists comes from the
// server schema, so when something new becomes editable it appears here on its
// own — no change to this file.
export default function ContentTab() {
  const [schema, setSchema] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    adminApi.contentSchema()
      .then(r => {
        setSchema(r.data);
        const keys = Object.keys(r.data.lists || {});
        if (keys.length) setActive(keys[0]);
      })
      .catch(() => toast.error('Failed to load the content schema'));
  }, []);

  if (!schema) {
    return <div className="flex justify-center py-16"><Loader className="w-6 h-6 text-gold-400 animate-spin" /></div>;
  }

  const lists = schema.lists || {};
  const keys = Object.keys(lists);

  return (
    <div>
      <h2 className="font-serif text-2xl text-gold-400 mb-1">Site Content</h2>
      <p className="text-gray-500 text-sm mb-5">
        Everything here is yours to change. Add, edit, reorder, hide or delete —
        it takes effect on the live site the moment you save.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {keys.map(k => (
          <button key={k} onClick={() => setActive(k)}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
              active === k
                ? 'border-gold-500 text-gold-400 bg-gold-500/10'
                : 'border-gold-600/20 text-gray-400 hover:text-gray-200'}`}>
            {lists[k].label}
          </button>
        ))}
      </div>

      {active && lists[active] && (
        <div className="card-cosmic p-5 rounded-2xl">
          <ContentEditor listKey={active} def={lists[active]} />
        </div>
      )}
    </div>
  );
}
