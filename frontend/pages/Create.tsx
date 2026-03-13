import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Coffee,
  Edit2,
  Footprints,
  Info,
  MapPin,
  Music,
  Palette,
  Plus,
  Trophy,
  Users,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivity } from "../context/ActivityContext";

const defaultCategories = [
  { name: "City Walk", icon: <Footprints size={20} /> },
  { name: "Workshop", icon: <Palette size={20} /> },
  { name: "Coffee Meetup", icon: <Coffee size={20} /> },
  { name: "Sports", icon: <Trophy size={20} /> },
  { name: "Music", icon: <Music size={20} /> }
];

function defaultDateAndTime(): { date: string; time: string } {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return { date, time: `${hh}:${mm}` };
}

export const Create: React.FC = () => {
  const navigate = useNavigate();
  const { createActivity } = useActivity();

  const defaults = useMemo(() => defaultDateAndTime(), []);

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0].name);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState(8);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePublish = async () => {
    const normalizedTitle = title.trim();
    const normalizedLocation = locationName.trim();
    const normalizedCategory = (isCustomCategory ? customCategory : selectedCategory).trim();

    if (!normalizedTitle) {
      setErrorMessage("Please enter activity title");
      return;
    }

    if (!normalizedCategory) {
      setErrorMessage("Please enter category");
      return;
    }

    if (!normalizedLocation) {
      setErrorMessage("Please enter location");
      return;
    }

    if (!date || !time) {
      setErrorMessage("Please pick date and time");
      return;
    }

    setErrorMessage(null);
    setIsPublishing(true);
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      await createActivity({
        title: normalizedTitle,
        location: normalizedLocation,
        start_time: startTime,
        category: normalizedCategory,
        description: description.trim(),
        max_participants: limit,
        image_url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop"
      });
      navigate("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to publish activity");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="font-sans bg-background-light text-slate-900 min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/5 transition-all duration-300">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-center flex-1">Create Activity</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-2 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold mb-3 px-1 text-slate-900">Activity Title</h2>
            <div className="group relative">
              <input
                className="w-full bg-white border-0 rounded-2xl py-6 px-5 text-xl font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm shadow-primary/5"
                placeholder="Give your activity a clear name"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                <Edit2 size={20} />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Category</label>
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-3 -mx-5 px-5 snap-x">
              {defaultCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setIsCustomCategory(false);
                  }}
                  className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full transition-transform active:scale-95 ${
                    !isCustomCategory && selectedCategory === cat.name
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white border border-slate-100 text-slate-600"
                  }`}
                >
                  {cat.icon}
                  <span className="font-semibold text-sm">{cat.name}</span>
                </button>
              ))}
              <button
                onClick={() => setIsCustomCategory(true)}
                className={`snap-start shrink-0 flex items-center justify-center w-12 h-10 rounded-full transition-transform active:scale-95 ${
                  isCustomCategory ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white border border-slate-100 text-slate-600"
                }`}
                aria-label="Custom category"
              >
                <Plus size={24} />
              </button>
            </div>
            {isCustomCategory && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <input
                  className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  placeholder="Custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        </section>

        <hr className="border-dashed border-slate-200" />

        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-bold px-1 text-slate-900">Time & Location</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative flex flex-col gap-1.5 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-primary/20 transition-colors cursor-pointer shadow-sm group">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Date</span>
              </div>
              <input
                type="date"
                className="font-bold text-lg leading-tight bg-transparent border-none p-0 focus:ring-0 text-slate-900 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="relative flex flex-col gap-1.5 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-primary/20 transition-colors cursor-pointer shadow-sm group">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Time</span>
              </div>
              <input
                type="time"
                className="font-bold text-lg leading-tight bg-transparent border-none p-0 focus:ring-0 text-slate-900 w-full"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              <MapPin size={20} />
            </div>
            <input
              className="w-full bg-white border-0 rounded-2xl py-4 pl-12 pr-4 text-base font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              placeholder="Enter activity location (e.g. Jing'an Park)"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
        </section>

        <hr className="border-dashed border-slate-200" />

        <section className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-baseline mb-3 px-1">
              <h2 className="text-xl font-bold text-slate-900">Activity Description</h2>
              <span className="text-xs font-medium text-slate-400">Optional</span>
            </div>
            <textarea
              className="w-full bg-white border-0 rounded-2xl p-5 min-h-[140px] text-base leading-relaxed placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 resize-none shadow-sm"
              placeholder="Describe details, what to bring, and meetup notes"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end mt-2 px-1">
              <span className="text-xs text-slate-400 font-medium">{description.length}/500</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users size={20} />
                </div>
                <span className="font-bold text-slate-900">Participant Limit</span>
              </div>
              <span className="font-bold text-2xl text-primary font-display">{limit}</span>
            </div>
            <div className="px-2">
              <input
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                type="range"
                min="2"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between mt-3 text-xs font-semibold text-slate-400">
                <span>Small group</span>
                <span>Large event</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600 flex items-center gap-2">
              <Info size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
        </section>
        <div className="h-10" />
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-gradient-to-t from-background-light via-background-light to-transparent z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            <span>{isPublishing ? "Publishing..." : "Publish Activity"}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
