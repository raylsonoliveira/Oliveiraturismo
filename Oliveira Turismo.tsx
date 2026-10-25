<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oliveira Turismo - Gestão de Poltronas</title>
  
  <!-- Tailwind CSS para o visual -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React 18 e Babel Standalone -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Firebase App e Firestore (SDK Compat - Carregamento direto, sem erros de módulos/CORS) -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9fafb; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    // =====================================================================
    // CONFIGURAÇÃO DO SEU FIREBASE (OLIVEIRA TURISMO)
    // =====================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyAyyxli8ZGqR56w3dBrnr1jfXSap83Z86s",
      authDomain: "oliveira-turismo.firebaseapp.com",
      projectId: "oliveira-turismo",
      storageBucket: "oliveira-turismo.firebasestorage.app",
      messagingSenderId: "19157203334",
      appId: "1:19157203334:web:1e2aeff5198b1d8b7e5407",
      measurementId: "G-Y7Y4YWLPM9"
    };

    // Inicialização segura do Firebase
    let db = null;
    try {
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "COLE_AQUI") {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
      }
    } catch (e) {
      console.error("Erro ao iniciar Firebase:", e);
    }

    // =====================================================================
    // ÍCONES EM SVG
    // =====================================================================
    const IconBus = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
    );
    const IconUser = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
    );
    const IconShield = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    );
    const IconSearch = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    );
    const IconArrowLeft = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    );
    const IconCheck = () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    );

    // =====================================================================
    // COMPONENTE PRINCIPAL (APP)
    // =====================================================================
    function App() {
      const [view, setView] = useState('home');
      const [seats, setSeats] = useState({});
      const [loading, setLoading] = useState(true);
      const [firebaseError, setFirebaseError] = useState(null);
      
      const [password, setPassword] = useState('');
      const [loginError, setLoginError] = useState('');

      const [selectedSeat, setSelectedSeat] = useState(null);
      const [modalOpen, setModalOpen] = useState(false);
      const [passengerName, setPassengerName] = useState('');
      const [passengerRG, setPassengerRG] = useState('');
      const [saving, setSaving] = useState(false);

      const [searchQuery, setSearchQuery] = useState('');
      const [searchResults, setSearchResults] = useState([]);
      const [hasSearched, setHasSearched] = useState(false);

      // Conexão em tempo real com o banco Firestore
      useEffect(() => {
        if (!db) {
          setLoading(false);
          return;
        }

        const unsubscribe = db.collection('bus_seats').onSnapshot(
          (snapshot) => {
            const data = {};
            snapshot.forEach(doc => {
              data[doc.id] = doc.data();
            });
            setSeats(data);
            setLoading(false);
            setFirebaseError(null);
          },
          (error) => {
            console.error("Erro no Firebase Firestore:", error);
            setFirebaseError(error.message);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      }, []);

      const handleAdminLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
          setView('admin');
          setPassword('');
          setLoginError('');
        } else {
          setLoginError('Senha incorreta.');
        }
      };

      const openSeatModal = (seatNum) => {
        setSelectedSeat(seatNum);
        const existingData = seats[seatNum] || { name: '', rg: '' };
        setPassengerName(existingData.name || '');
        setPassengerRG(existingData.rg || '');
        setModalOpen(true);
      };

      const closeSeatModal = () => {
        setModalOpen(false);
        setSelectedSeat(null);
        setPassengerName('');
        setPassengerRG('');
      };

      const saveSeat = async (e) => {
        e.preventDefault();
        if (!selectedSeat) return;
        setSaving(true);

        const cleanName = passengerName.trim();
        const cleanRG = passengerRG.trim();

        if (db) {
          try {
            const seatRef = db.collection('bus_seats').doc(selectedSeat.toString());
            if (cleanName === '') {
              await seatRef.delete();
            } else {
              await seatRef.set({
                name: cleanName,
                rg: cleanRG,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
            }
          } catch (err) {
            console.error("Erro ao salvar no Firebase:", err);
            alert("Erro ao salvar: " + (err.message || err));
          }
        } else {
          // Modo local/offline para testes
          setSeats(prev => {
            const updated = { ...prev };
            if (cleanName === '') {
              delete updated[selectedSeat];
            } else {
              updated[selectedSeat] = { name: cleanName, rg: cleanRG };
            }
            return updated;
          });
        }
        setSaving(false);
        closeSeatModal();
      };

      const removeSeat = async () => {
        if (!selectedSeat) return;
        setSaving(true);
        if (db) {
          try {
            const seatRef = db.collection('bus_seats').doc(selectedSeat.toString());
            await seatRef.delete();
          } catch (err) {
            console.error("Erro ao remover:", err);
            alert("Erro ao remover: " + (err.message || err));
          }
        } else {
          setSeats(prev => {
            const updated = { ...prev };
            delete updated[selectedSeat];
            return updated;
          });
        }
        setSaving(false);
        closeSeatModal();
      };

      const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
          setSearchResults([]);
          setHasSearched(true);
          return;
        }
        const query = searchQuery.trim().toLowerCase();
        const results = Object.entries(seats)
          .filter(([num, data]) => data && data.name && data.name.toLowerCase().includes(query))
          .map(([num, data]) => ({ seat: num, name: data.name }));
        setSearchResults(results);
        setHasSearched(true);
      };

      if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
              <p className="text-gray-500 font-medium">Carregando poltronas...</p>
            </div>
          </div>
        );
      }

      // =====================================================================
      // TELA 1: HOME
      // =====================================================================
      const renderHome = () => (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-blue-800 p-8 text-center text-white">
              <div className="text-yellow-400 mx-auto mb-4 flex justify-center"><IconBus /></div>
              <h1 className="text-2xl font-bold tracking-tight">Oliveira Turismo</h1>
              <p className="text-yellow-200 text-sm mt-1">Gestão de Poltronas e Viagens</p>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => setView('passenger')} 
                className="w-full flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 px-6 rounded-xl transition-all shadow hover:shadow-md cursor-pointer"
              >
                <IconUser /><span>Localizar Minha Poltrona</span>
              </button>
              <button 
                onClick={() => setView('admin_login')} 
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 border border-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                <IconShield /><span>Acesso Administrativo</span>
              </button>
            </div>
          </div>
        </div>
      );

      // =====================================================================
      // TELA 2: LOGIN DO ADMIN
      // =====================================================================
      const renderAdminLogin = () => (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <button 
              onClick={() => setView('home')} 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium cursor-pointer"
            >
              <IconArrowLeft /> Voltar
            </button>
            <div className="text-center mb-8">
              <div className="text-blue-800 mx-auto mb-4 flex justify-center"><IconShield /></div>
              <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
              <p className="text-gray-500 text-sm mt-1">Digite a senha para gerenciar as poltronas</p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <input 
                  type="password" 
                  placeholder="Senha de acesso (padrão: admin123)" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-800 outline-none transition" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
              </div>
              <button 
                type="submit" 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-4 rounded-lg transition shadow cursor-pointer"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      );

      // =====================================================================
      // TELA 3: PAINEL ADMINISTRATIVO (MAPA DO ÔNIBUS)
      // =====================================================================
      const renderAdmin = () => {
        const totalSeats = 48;
        const occupiedCount = Object.keys(seats).length;

        return (
          <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-blue-800 shadow-md sticky top-0 z-10">
              <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between text-white">
                <button onClick={() => setView('home')} className="p-2 hover:bg-blue-700 rounded-lg cursor-pointer">
                  <IconArrowLeft />
                </button>
                <h2 className="text-lg font-bold">Gestão do Ônibus (48 Lugares)</h2>
                <div className="w-8"></div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 mt-4">
              {!db && (
                <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
                  ⚠️ MODO LOCAL: Banco Firebase não detectado. As alterações só ficam na memória desta aba.
                </div>
              )}
              {firebaseError && (
                <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
                  ❌ Atenção: Falha de conexão com o Firebase ({firebaseError}).<br/>
                  <span className="font-normal text-xs text-red-700">Verifique se as Regras (Rules) do Firestore no Firebase Console estão liberadas para leitura/escrita.</span>
                </div>
              )}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Status da Ocupação</h3>
                  <p className="text-sm text-gray-500">Clique em qualquer poltrona para cadastrar ou liberar</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-800">{occupiedCount}</span>
                  <span className="text-gray-500 font-semibold text-lg"> / {totalSeats}</span>
                </div>
              </div>

              {/* Layout do Ônibus */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="flex flex-col gap-3 mx-auto" style={{ minWidth: '300px', maxWidth: '340px' }}>
                  <div className="w-full flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motorista</span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Porta de Entrada</span>
                  </div>

                  {Array.from({ length: 12 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-between items-center w-full">
                      <div className="flex gap-2">
                        <SeatButton num={rowIndex * 4 + 1} />
                        <SeatButton num={rowIndex * 4 + 2} />
                      </div>
                      <div className="w-6 flex flex-col items-center justify-center opacity-30">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mb-1"></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="flex gap-2">
                        <SeatButton num={rowIndex * 4 + 3} />
                        <SeatButton num={rowIndex * 4 + 4} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal de Cadastro / Edição da Poltrona */}
            {modalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="bg-blue-800 px-6 py-4 flex items-center justify-between text-white">
                    <h3 className="text-lg font-bold">Poltrona {selectedSeat}</h3>
                    <button onClick={closeSeatModal} className="text-gray-300 hover:text-white font-bold text-xl cursor-pointer">✕</button>
                  </div>
                  <form onSubmit={saveSeat} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo do Passageiro</label>
                      <input 
                        type="text" 
                        placeholder="Ex: João da Silva"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none" 
                        value={passengerName} 
                        onChange={(e) => setPassengerName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">RG / Documento</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 12.345.678-9"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none" 
                        value={passengerRG} 
                        onChange={(e) => setPassengerRG(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="pt-4 flex gap-3">
                      {seats[selectedSeat] && (
                        <button 
                          type="button" 
                          disabled={saving}
                          onClick={removeSeat} 
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 rounded-lg transition cursor-pointer"
                        >
                          Liberar
                        </button>
                      )}
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="flex-[2] bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2.5 rounded-lg transition cursor-pointer"
                      >
                        {saving ? 'Salvando...' : 'Salvar Poltrona'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      };

      const SeatButton = ({ num }) => {
        const isOccupied = !!seats[num];
        return (
          <button
            type="button"
            onClick={() => openSeatModal(num)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-base transition border-b-4 cursor-pointer select-none ${
              isOccupied 
                ? 'bg-yellow-400 text-blue-900 border-yellow-600 hover:bg-yellow-500' 
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <span>{num}</span>
            {isOccupied && (
              <div className="opacity-80 scale-75">
                <IconUser />
              </div>
            )}
          </button>
        );
      };

      // =====================================================================
      // TELA 4: CONSULTA DO PASSAGEIRO
      // =====================================================================
      const renderPassenger = () => (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
            <button 
              onClick={() => { setView('home'); setSearchResults([]); setSearchQuery(''); setHasSearched(false); }} 
              className="text-gray-500 hover:text-gray-800 p-1 cursor-pointer"
            >
              <IconArrowLeft />
            </button>
            <h2 className="text-lg font-bold text-blue-800">Localize sua Poltrona</h2>
            <div className="w-6"></div>
          </div>

          <div className="max-w-md w-full mx-auto p-6">
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Digite o seu nome completo:</label>
              <input 
                type="text" 
                placeholder="Ex: Maria Oliveira" 
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl shadow-sm text-lg outline-none focus:ring-2 focus:ring-blue-800 transition" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <button 
                type="submit" 
                className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 rounded-xl text-lg shadow transition cursor-pointer"
              >
                Buscar Minha Poltrona
              </button>
            </form>

            <div className="space-y-4">
              {hasSearched && searchResults.length === 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center border border-red-200 font-medium">
                  Nenhuma reserva encontrada com o nome digitado. Verifique a grafia ou consulte o organizador.
                </div>
              )}
              {hasSearched && searchResults.map((result, idx) => (
                <div key={idx} className="bg-white border-2 border-blue-800 rounded-2xl p-6 text-center shadow-lg animate-in fade-in duration-200">
                  <div className="flex justify-center text-green-600 mb-2"><IconCheck /></div>
                  <h4 className="text-xl font-bold text-gray-900 capitalize">{result.name}</h4>
                  <div className="w-full border-t border-dashed border-gray-200 my-4"></div>
                  <p className="text-gray-500 text-sm font-medium">Sua poltrona reservada é:</p>
                  <div className="text-6xl font-black text-blue-800 my-2">{result.seat}</div>
                  <p className="text-xs text-gray-400">Tenha uma excelente viagem com a Oliveira Turismo!</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      switch (view) {
        case 'admin_login': return renderAdminLogin();
        case 'admin': return renderAdmin();
        case 'passenger': return renderPassenger();
        default: return renderHome();
      }
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
