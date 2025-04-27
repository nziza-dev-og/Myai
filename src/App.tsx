import  { ChatContainer } from './components/ChatContainer';

function App() {
  return (
    <div className="flex flex-col h-screen p-4 md:p-6">
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-800 rounded-xl shadow-xl p-4">
        <ChatContainer />
      </div>
      <div className="text-center py-2 text-xs text-gray-500">
         Created by Jules-dev 
      </div>
    </div>
  );
}

export default App;
 
