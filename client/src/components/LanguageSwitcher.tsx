import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.MouseEvent, lng: string) => {
    e.preventDefault();
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  return (
    <div style={{ zIndex: 9999, display: 'flex', gap: '8px' }}>
      <button
        onClick={(e) => changeLanguage(e, 'en')}
        style={{
          padding: '4px 8px',
          cursor: 'pointer',
          fontWeight: i18n.language?.startsWith('en') ? 'bold' : 'normal',
          backgroundColor: i18n.language?.startsWith('en') ? '#007bff' : '#f8f9fa',
          color: i18n.language?.startsWith('en') ? 'white' : 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          margin: '0'
        }}
      >
        EN
      </button>
      <button
        onClick={(e) => changeLanguage(e, 'fr')}
        style={{
          padding: '4px 8px',
          cursor: 'pointer',
          fontWeight: i18n.language?.startsWith('fr') ? 'bold' : 'normal',
          backgroundColor: i18n.language?.startsWith('fr') ? '#007bff' : '#f8f9fa',
          color: i18n.language?.startsWith('fr') ? 'white' : 'black',
          border: '1px solid #ccc',
          borderRadius: '4px',
          margin: '0'
        }}
      >
        FR
      </button>
    </div>
  );
}
