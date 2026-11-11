"use client";

export default function AdminShell({ base, current, children }) {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign(`${base}/login`);
  }

  const links = [
    { id: "products", href: base, label: "Товары" },
    { id: "games", href: `${base}/games`, label: "Игры" },
    { id: "orders", href: `${base}/orders`, label: "Заказы" },
  ];

  return (
    <div className="office-page">
      <header className="office-bar">
        <strong>Касса</strong>
        <nav>
          {links.map((link) => (
            <a key={link.id} href={link.href} data-active={current === link.id ? "true" : "false"}>
              {link.label}
            </a>
          ))}
        </nav>
        <button className="btn" type="button" onClick={logout}>
          Выйти
        </button>
      </header>
      {children}
    </div>
  );
}
