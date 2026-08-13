import { useState, useEffect } from 'react';

// 1. TypeScript'e verimizin yapısını (Modelini) öğretiyoruz
interface ScheduleModel {
  id: number;
  routeCode: string;
  routeName: string;
  terminalId: number;
  departureTime: string;
}

const Dashboard = () => {
  // 2. 'any' yerine kendi oluşturduğumuz ScheduleModel[] dizisini kullanıyoruz
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/schedules/terminal/1')
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Saatleri çekerken hata oluştu:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white flex flex-col items-center py-12 px-4 font-sans w-full">
      
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          Dijital Cüzdan
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">Apple & Anti-Gravity Deneyimi</p>
      </header>

      <div className="w-full max-w-md p-7 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden mb-10">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-12 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Kart Türü</span>
            <h2 className="text-2xl font-bold text-pink-300 tracking-wide mt-1">NORMAL</h2>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full shadow-inner">
            Aktif
          </span>
        </div>

        <div className="mb-8 relative z-10">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Güncel Bakiye</span>
          <div className="text-5xl font-extrabold tracking-tight text-white mt-1 drop-shadow-md">
            250.00 <span className="text-2xl font-medium text-slate-400">TL</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-300 pt-5 border-t border-white/10 relative z-10 font-mono">
          <span>4543 •••• •••• 0000</span>
          <span className="text-pink-300 font-semibold">Abonman: 185</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="text-lg font-semibold text-slate-200">Terminal: Kadıköy</h3>
          <span className="text-xs text-slate-400">Canlı Akış</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-slate-400 py-6 animate-pulse">Seferler yükleniyor...</div>
          ) : schedules.length > 0 ? (
            // 3. Artık 'any' kelimesini tamamen kaldırdık!
            schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold shadow-lg">
                    {schedule.routeCode}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{schedule.routeName}</span>
                    <span className="text-xs text-slate-400 mt-0.5">Sıradaki Sefer</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-white font-mono tracking-tighter">
                  {schedule.departureTime.substring(0, 5)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-6">Bu terminal için aktif sefer bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;