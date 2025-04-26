export  const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-[80%] flex-row">
        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-slate-700 mr-3">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="px-4 py-3 rounded-2xl message-bot rounded-tl-none">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 