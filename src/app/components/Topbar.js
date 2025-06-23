import '../styles/topbar.css';

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="search-bar">
        <input type="text" className="search-input" placeholder="Buscar..." />
      </div>
      <div className="user-profile">
        <span>U</span>
      </div>
    </div>
  );
}