import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown } from "lucide-react";
import { LANGUAGE_CATEGORIES } from "../../data/languages";

const INITIAL_VISIBLE = 6;

const LanguagePickerModal = ({ isOpen, onClose, selected, onSelect }) => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({});

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return LANGUAGE_CATEGORIES;
    const q = query.toLowerCase();
    return LANGUAGE_CATEGORIES.map((cat) => ({
      ...cat,
      languages: cat.languages.filter((l) => l.label.toLowerCase().includes(q)),
    })).filter((cat) => cat.languages.length > 0);
  }, [query]);

  const toggleExpand = (label) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handlePick = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-3xl rounded-xl2 p-6 shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent">
                Choose a Language
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            <div className="max-h-[55vh] space-y-6 overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                const isExpanded = expanded[cat.label] || query.trim();
                const visibleLangs = isExpanded
                  ? cat.languages
                  : cat.languages.slice(0, INITIAL_VISIBLE);
                const remaining = cat.languages.length - visibleLangs.length;

                return (
                  <div key={cat.label}>
                    <h3 className="mb-3 text-sm font-semibold text-primary">
                      {cat.label}
                    </h3>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {visibleLangs.map((lang) => {
                        const Icon = lang.icon;
                        const isSelected = selected === lang.value;
                        return (
                          <button
                            key={lang.value}
                            onClick={() => handlePick(lang.value)}
                            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-white"
                                : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon size={26} />
                            {lang.label}
                          </button>
                        );
                      })}
                    </div>

                    {!query.trim() && remaining > 0 && (
                      <button
                        onClick={() => toggleExpand(cat.label)}
                        className="mt-3 flex items-center gap-1 text-xs text-muted transition hover:text-white"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                        {isExpanded ? "Show less" : `Show ${remaining} more`}
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">
                  No languages match "{query}"
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguagePickerModal;